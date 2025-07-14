import OpenAI from "openai";
import {
  MCPConfig,
} from "../types/index";
import { LLMConfig } from "../config/index";
import {
  onboardingFunctionTools,
} from "../tools/onboarding-definitions";
// Note: Using custom onboarding stream handler instead of generic aiStreamingService
import {
  generateStageSpecificPrompt,
} from "../prompts/prompt-orchestrator";
import { SystemPromptLogger } from "@/lib/utils/system-prompt-logger";

interface OnboardingRequestBody {
  message: string;
  conversationHistory?: Array<{
    id: string;
    content: string;
    sender: "user" | "ai";
    timestamp: string;
  }>;
  userProfile?: Record<string, unknown>;
  user_id: string;
}

// OnboardingConversationMessage interface removed as it's not needed without memory management

/**
 * Orchestrator service for Onboarding AI stream processing with MCP tools integration
 * Handles the complete flow from request to response for onboarding (without memory management)
 */
export class OnboardingOrchestratorService {
  private openaiClient: OpenAI;
  private mcpConfig: MCPConfig;

  constructor(
    openaiClient: OpenAI,
    mcpConfig: MCPConfig
  ) {
    this.openaiClient = openaiClient;
    this.mcpConfig = mcpConfig;

    console.log("🎯 OnboardingOrchestratorService initialized:", {
      hasOpenAIClient: !!this.openaiClient,
      mcpEnabled: this.mcpConfig.enabled,
      mcpServerUrl: this.mcpConfig.serverUrl,
    });
  }

  /**
   * Process onboarding AI request and create stream response with MCP tools
   */
  async processRequest(
    requestBody: OnboardingRequestBody,
    llmConfig: LLMConfig
  ): Promise<ReadableStream> {
    console.log("🔄 OnboardingOrchestrator.processRequest started");

    const { message, conversationHistory, userProfile, user_id } =
      requestBody;

    console.log("🚀 Onboarding AI Stream Function Called");
    console.log("👤 User ID:", user_id);
    console.log("🤖 LLM Provider:", llmConfig.provider);
    console.log("📝 Message:", message);
    console.log("💬 History Length:", conversationHistory?.length || 0);
    console.log("🔧 MCP Enabled:", this.mcpConfig.enabled);

    // Generate stage-specific system prompt for onboarding
    console.log("📝 Generating onboarding system prompt...");
    const systemInstructions = generateStageSpecificPrompt({
      userId: user_id,
      userProfile: userProfile || {},
      conversationHistory: [], // Empty array - conversation history goes to input field instead
    });



    // Log system prompt to file for debugging 
    const requestId = await SystemPromptLogger.logSystemPrompt({
      userId: user_id,
      userProfile,
      conversationHistory: (conversationHistory || []).map(msg => ({
        role: msg.sender === "user" ? "user" as const : "assistant" as const,
        content: msg.content,
      })),
      systemPrompt: systemInstructions,
      userMessage: message,
    });

    // Also log summary for daily tracking
    await SystemPromptLogger.logPromptSummary({
      userId: user_id,
      promptLength: systemInstructions.length,
      userMessage: message,
      requestId,
    });

    const onboardingTools = this.convertToolsForResponsesAPI(onboardingFunctionTools);
    
    // Add MCP tool if enabled (use union type for function and MCP tools)
    const allTools: Array<ReturnType<typeof this.convertToolsForResponsesAPI>[number] | { type: "mcp"; server_label: string; server_url: string; [key: string]: unknown }> = [...onboardingTools];
    if (this.mcpConfig.enabled) {
      const mcpTool = {
        type: "mcp" as const,
        server_label: this.mcpConfig.serverLabel,
        server_url: this.mcpConfig.serverUrl,
        allowed_tools: this.mcpConfig.allowedTools,
        require_approval: this.mcpConfig.requireApproval,
        ...(this.mcpConfig.bearerToken && {
          headers: {
            Authorization: `Bearer ${this.mcpConfig.bearerToken}`
          }
        })
      };
      allTools.push(mcpTool);
    }

    // Prepare input for Responses API - include complete conversation history + current message
    const completeConversationHistory = (conversationHistory || []).map((msg) => ({
      role: msg.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: msg.content,
    }));

    const input = [
      ...completeConversationHistory,
      { role: "user" as const, content: message },
    ];

    // Process OpenAI stream with MCP integration
    
    return this.processOpenAIStreamWithMCP(
      systemInstructions,
      input,
      allTools,
      llmConfig,
      user_id
    );
  }

  /**
   * Convert function tools to Responses API format
   */
  private convertToolsForResponsesAPI(tools: typeof onboardingFunctionTools) {
    return tools.map((tool) => ({
      type: "function" as const,
      name: tool.function.name,
      description: tool.function.description,
      parameters: tool.function.parameters,
      strict: false,
    }));
  }

  /**
   * Process OpenAI stream with MCP integration for onboarding (without memory)
   */
  private async processOpenAIStreamWithMCP(
    systemInstructions: string,
    input: Array<{ role: "user" | "assistant"; content: string }>,
    allTools: Array<ReturnType<typeof this.convertToolsForResponsesAPI>[number] | { type: "mcp"; server_label: string; server_url: string; [key: string]: unknown }>,
    llmConfig: LLMConfig,
    userId: string
  ): Promise<ReadableStream> {


    try {
      
      
      // Create stream configuration with MCP support (MCP tools are in the tools array)
      const streamConfig = {
        model: llmConfig.model,
        instructions: systemInstructions, // System prompt goes here
        input: input, // Conversation history + current message
        tools: allTools, // Include both function tools and MCP tools
        stream: true as const,
        temperature: llmConfig.temperature,
      };


      const stream = await this.openaiClient.responses.create(streamConfig);


      // Return custom onboarding stream with specialized tool handling
      return this.createOnboardingReadableStream(stream);
    } catch (error) {
      console.error("❌ Onboarding OpenAI streaming error:", error);
      console.error("❌ Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "No stack",
      });
      throw error;
    }
  }

  /**
   * Create custom onboarding ReadableStream with specialized tool handling
   */
  private createOnboardingReadableStream(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stream: any // OpenAI ResponseStreamEvent type is complex, using any for simplicity
  ): ReadableStream {
    return new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          let responseContent = "";
          const functionCalls: Record<string, {
            id: string;
            name: string;
            arguments: string;
            call_id: string;
            status?: "new" | "in_progress" | "done";
          }> = {};

          // Generate unique response ID
          const responseId = `resp-${Date.now()}`;

          // Send response created event
          const responseCreatedData = {
            type: "response_created",
            response_id: responseId,
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(responseCreatedData)}\n\n`)
          );

          // Process streaming response from Responses API
          for await (const event of stream) {
            // Handle text streaming
            if (event.type === "response.output_text.delta") {
              responseContent += event.delta;
              const data = {
                type: "response_output_text_streaming",
                response_id: responseId,
                content: event.delta,
                timestamp: new Date().toISOString(),
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
              );
            }

            // Handle function call item added
            if (event.type === "response.output_item.added") {
              if (event.item?.type === "function_call") {
                const functionCall = event.item;
                functionCalls[functionCall.id] = {
                  id: functionCall.id,
                  name: functionCall.name,
                  arguments: "",
                  call_id: functionCall.call_id,
                  status: "new",
                };
                console.log(
                  "🔧 New onboarding function call:",
                  functionCall.id,
                  functionCall.name
                );
              }
            }

            // Handle function call arguments completion
            if (event.type === "response.function_call_arguments.done") {
              const itemId = event.item_id;
              if (functionCalls[itemId]) {
                functionCalls[itemId].arguments = event.arguments;
                functionCalls[itemId].status = "done";
                console.log(
                  `🔧 Function call arguments complete for ${functionCalls[itemId].name} (${itemId}):`,
                  event.arguments
                );
              }
            }

            // Handle MCP tool calls
            if (event.type === "response.mcp_call.in_progress") {
              const mcpData = {
                type: "mcp_tool_calling",
                timestamp: new Date().toISOString(),
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(mcpData)}\n\n`)
              );
            }

            if (event.type === "response.mcp_call.done") {
              const mcpDoneData = {
                type: "mcp_tool_call_done",
                timestamp: new Date().toISOString(),
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(mcpDoneData)}\n\n`)
              );
            }

            // Handle response completion
            if (event.type === "response.completed") {
              console.log("🏁 Onboarding responses stream finished");

              // Send final text content if any exists
              if (responseContent) {
                const textDoneData = {
                  type: "response_output_text_done",
                  content: responseContent,
                  timestamp: new Date().toISOString(),
                };
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(textDoneData)}\n\n`)
                );
              }

              // Process any complete function calls with onboarding-specific logic
              for (const itemId in functionCalls) {
                const call = functionCalls[itemId];
                
                if (call.status === "done") {
                  try {
                    console.log(`🔧 Processing onboarding tool call: ${call.name}`);
                    
                    // Parse tool arguments
                    let toolData: Record<string, unknown> = {};
                    if (call.arguments && call.arguments.trim().length > 0) {
                      try {
                        toolData = JSON.parse(call.arguments);
                      } catch (parseError) {
                        console.error(`❌ Failed to parse arguments for ${call.name}:`, parseError);
                        continue;
                      }
                    }

                    // Handle onboarding-specific tools
                    if (call.name === "show_onboarding_component") {
                      const componentId = (toolData.component_id as string) || `${toolData.component_type}_${Date.now()}`;
                      
                      const action = {
                        type: "show_component",
                        payload: {
                          componentType: toolData.component_type,
                          componentId: componentId,
                          title: toolData.title,
                          context: toolData.context,
                        },
                      };

                      console.log("📤 Sent onboarding component action:", action.payload.componentType);
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify(action)}\n\n`)
                      );
                    } else if (call.name === "complete_onboarding") {
                      console.log("🏁 Triggering onboarding completion");
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ type: "onboarding_complete" })}\n\n`)
                      );
                    } else {
                      console.log(`✅ Function call ${call.name} processed successfully`);
                    }
                  } catch (error) {
                    console.error(`❌ Error processing tool call ${call.name}:`, error);
                  }
                }
              }

              // Send done event and close
              const doneData = {
                type: "response_done",
                response_id: responseId,
                timestamp: new Date().toISOString(),
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(doneData)}\n\n`)
              );
              break;
            }
          }

          controller.close();
        } catch (error) {
          console.error("❌ Error in onboarding stream:", error);
          const errorData = {
            type: "error",
            message: "An unexpected error occurred during the stream.",
            details: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`)
          );
          controller.close();
        }
      },
    });
  }

  // Note: Tool processing logic is now inline within the stream handler
} 