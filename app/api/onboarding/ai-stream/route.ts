import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { generateOnboardingSystemPrompt } from "@/lib/ai-advisor/prompts/onboarding-system-prompt";
import { onboardingFunctionTools, validateComponentArguments } from "@/lib/ai-advisor/tools/onboarding-definitions";
import { SystemPromptLogger } from "@/lib/utils/system-prompt-logger";

// Initialize OpenAI client
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface OnboardingStreamRequest {
  message: string;
  conversationHistory?: Array<{
    id: string;
    content: string;
    sender: "user" | "ai";
    timestamp: string;
  }>;
  userProfile?: Record<string, unknown>;
  currentStep?: string;
}

interface ToolCallData {
  component_type?: string;
  title?: string;
  component_id?: string;
  context?: Record<string, unknown>;
  profile_updates?: Record<string, unknown>;
  profile_data?: Record<string, unknown>;
  trigger_completion?: boolean;
}

// Type definitions for OpenAI Responses API events
interface FunctionCallItem {
  id: string;
  name: string;
  call_id: string;
  type: "function_call";
}

interface ResponseOutputItemAddedEvent {
  type: "response.output_item.added";
  item: FunctionCallItem;
}

interface FunctionCallArgumentsDoneEvent {
  type: "response.function_call_arguments.done";
  item_id: string;
  arguments: string;
}

// Convert function tools to Responses API format (flatten structure)
const convertToolsForResponsesAPI = (tools: typeof onboardingFunctionTools) => {
  return tools.map(tool => ({
    type: "function" as const,
    name: tool.function.name,
    description: tool.function.description,
    parameters: tool.function.parameters,
    strict: false
  }));
};

export async function POST(request: NextRequest) {
  console.log("🚀 POST /api/onboarding/ai-stream called");
  
  try {
    const requestBody: OnboardingStreamRequest = await request.json();
    
    console.log("📥 Onboarding stream request:", {
      hasMessage: !!requestBody.message,
      messageLength: requestBody.message?.length || 0,
      hasHistory: !!requestBody.conversationHistory,
      historyLength: requestBody.conversationHistory?.length || 0,
      currentStep: requestBody.currentStep || 'unknown',
      hasUserProfile: !!requestBody.userProfile
    });

    // Create Supabase client for authentication
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server Component context
            }
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("❌ Authentication failed:", authError?.message || "No user found");
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    console.log("✅ User authenticated:", user.id);

    // Generate onboarding-specific system prompt
    const conversationHistory = (requestBody.conversationHistory || []).map(msg => {
      if (msg.sender === "user") {
        return { role: "user" as const, content: msg.content };
      } else {
        return { role: "assistant" as const, content: msg.content };
      }
    });

    const systemPrompt = generateOnboardingSystemPrompt(
      user.id,
      requestBody.userProfile || {},
      conversationHistory,
      requestBody.currentStep || "ai_welcome"
    );

    console.log("📝 Generated onboarding system prompt");

    // Log system prompt to file for debugging
    const requestId = await SystemPromptLogger.logSystemPrompt({
      userId: user.id,
      currentStep: requestBody.currentStep || "ai_welcome",
      userProfile: requestBody.userProfile,
      conversationHistory,
      systemPrompt,
      userMessage: requestBody.message,
    });

    // Also log summary for daily tracking
    await SystemPromptLogger.logPromptSummary({
      userId: user.id,
      currentStep: requestBody.currentStep || "ai_welcome",
      promptLength: systemPrompt.length,
      userMessage: requestBody.message,
      requestId,
    });

    // Prepare input for Responses API
    const input = [
      { role: "system" as const, content: systemPrompt },
      ...conversationHistory.slice(-5), // Keep last 5 messages
      { role: "user" as const, content: requestBody.message }
    ];

    // Convert tools for Responses API format
    const responsesApiTools = convertToolsForResponsesAPI(onboardingFunctionTools);

    console.log("💬 Prepared input for Responses API:", {
      totalMessages: input.length,
      systemPromptLength: systemPrompt.length,
      requestId: requestId
    });

    // Set up SSE headers
    const headers = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });

    // Create readable stream
    const readable = new ReadableStream({
      async start(controller) {
        console.log("🌊 Starting onboarding responses stream...");
        
        try {
          // Debug logging for input and tools
          console.log("🔧 Available onboarding tools:", responsesApiTools.length);
          console.log("📝 Final input for AI:", {
            count: input.length,
            systemPromptLength: input[0]?.content?.length || 0,
            lastUserMessage: input[input.length - 1]?.content?.substring(0, 100) + "..."
          });

          // Use Responses API with streaming
          const stream = await openaiClient.responses.create({
            model: "gpt-4.1-2025-04-14",
            input: input,
            tools: responsesApiTools,
            stream: true,
            temperature: 0.7,
          });

          const encoder = new TextEncoder();
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
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(responseCreatedData)}\n\n`));

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
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            }

            // Handle function call item added
            if (event.type === "response.output_item.added") {
              const typedEvent = event as ResponseOutputItemAddedEvent;
              if (typedEvent.item?.type === "function_call") {
                const functionCall = typedEvent.item;
                functionCalls[functionCall.id] = {
                  id: functionCall.id,
                  name: functionCall.name,
                  arguments: "",
                  call_id: functionCall.call_id,
                  status: "new",
                };
                console.log("🔧 New onboarding function call:", functionCall.id, functionCall.name);
              }
            }

            // Handle function call arguments completion
            if (event.type === "response.function_call_arguments.done") {
              const typedEvent = event as FunctionCallArgumentsDoneEvent;
              const itemId = typedEvent.item_id;
              if (functionCalls[itemId]) {
                functionCalls[itemId].arguments = typedEvent.arguments;
                functionCalls[itemId].status = "done";
                console.log(`🔧 Function call arguments complete for ${functionCalls[itemId].name} (${itemId}):`, typedEvent.arguments);
              }
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
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(textDoneData)}\n\n`));
              }

              // Process any complete function calls
              const successfulCalls: (typeof functionCalls[string])[] = [];
              const failedCalls: { call: typeof functionCalls[string]; error: string }[] = [];

              for (const itemId in functionCalls) {
                const call = functionCalls[itemId];
                
                try {
                  console.log(`🔧 Processing function call ${call.name} (${itemId}):`);
                  console.log(`🔧 Raw arguments string: "${call.arguments}"`);
                  console.log(`🔧 Arguments length: ${call.arguments.length}`);
                  
                  // Handle empty or invalid arguments
                  let toolData: ToolCallData = {};
                  let hasValidArguments = false;
                  
                  if (call.arguments && call.arguments.trim().length > 0) {
                    try {
                      toolData = JSON.parse(call.arguments);
                      console.log("✅ Successfully parsed arguments for:", call.name, toolData);
                      
                      // Validate arguments if this is show_onboarding_component
                      if (call.name === "show_onboarding_component") {
                        const validation = validateComponentArguments(toolData);
                        if (validation.isValid) {
                          hasValidArguments = true;
                          console.log("✅ Arguments validation passed for:", call.name);
                        } else {
                          console.error(`❌ Argument validation failed for ${call.name}:`, validation.errors);
                          const errorMsg = `Invalid arguments for ${call.name}: ${validation.errors.join(", ")}`;
                          const errorData = { 
                            type: "tool_error", 
                            tool_name: call.name, 
                            error: errorMsg,
                            details: { 
                              rawArguments: call.arguments,
                              validationErrors: validation.errors,
                              hint: "Please provide all required parameters: component_type, title, component_id, context"
                            }
                          };
                          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
                          failedCalls.push({ call, error: errorMsg });
                          continue;
                        }
                      } else {
                        hasValidArguments = true;
                      }
                    } catch (parseError) {
                      console.error(`❌ Failed to parse arguments for ${call.name}:`, parseError);
                      const errorMsg = `Invalid JSON arguments provided by AI for ${call.name}. Please provide valid JSON.`;
                      const errorData = { 
                        type: "tool_error", 
                        tool_name: call.name, 
                        error: errorMsg, 
                        details: { 
                          rawArguments: call.arguments,
                          parseError: parseError instanceof Error ? parseError.message : String(parseError),
                          hint: "Arguments must be valid JSON format"
                        }
                      };
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
                      failedCalls.push({ call, error: errorMsg });
                      continue;
                    }
                  } else {
                    console.warn(`⚠️ Empty arguments for ${call.name}, will provide defaults if possible`);
                  }
                  
                  if (call.name === "show_onboarding_component") {
                    // If we already have valid arguments, use them directly
                    if (hasValidArguments) {
                      // Ensure component_id is set
                      const componentId = toolData.component_id || `${toolData.component_type}_${Date.now()}`;
                      
                      const action = {
                        type: "show_component",
                        payload: {
                          componentType: toolData.component_type,
                          componentId: componentId,
                          title: toolData.title,
                          context: toolData.context,
                        },
                      };
                      
                      console.log("📤 Sent onboarding component action (from valid args):", action.payload.componentType, "with ID:", componentId);
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(action)}\n\n`));
                      successfulCalls.push(call);
                      continue;
                    }
                    
                    // If arguments are invalid, don't use fallbacks - just report the error
                    console.error("🔧 Invalid arguments for show_onboarding_component, not using fallbacks");
                    const errorMsg = "Component arguments validation failed. Please provide valid component parameters.";
                    const errorData = { 
                      type: "tool_error", 
                      tool_name: call.name, 
                      error: errorMsg,
                      details: { 
                        message: "The AI needs to provide proper component parameters"
                      }
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
                    failedCalls.push({ call, error: errorMsg });
                    continue;

                  } else if (call.name === "update_onboarding_profile") {
                      const { profile_updates } = toolData;
                      if (!profile_updates) {
                        throw new Error("Missing profile_updates in tool call");
                      }
                      const { error: updateError } = await supabase.from("users").update(profile_updates).eq('user_id', user.id);
                      if (updateError) throw new Error(`Supabase error updating profile: ${updateError.message}`);
                      console.log("✅ Profile updated successfully for user:", user.id);
                      successfulCalls.push(call);

                  } else if (call.name === "complete_onboarding") {
                      const { error: updateError } = await supabase.from("users").update({ onboarding_completed: true, onboarding_completed_at: new Date().toISOString() }).eq('user_id', user.id);
                      if (updateError) throw new Error(`Supabase error completing onboarding: ${updateError.message}`);
                      console.log("✅ Onboarding completed for user:", user.id);
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "onboarding_complete" })}\n\n`));
                      successfulCalls.push(call);
                      
                  } else {
                    console.log(`✅ Function call ${call.name} not handled explicitly, assuming success.`);
                    successfulCalls.push(call);
                  }

                } catch (error: unknown) {
                  const errorMessage = error instanceof Error ? error.message : String(error);
                  console.error(`❌ Error processing tool call ${call.name} (${call.id}):`, errorMessage);
                  const errorData = { type: "tool_error", tool_name: call.name, error: `Error processing tool call: ${errorMessage}` };
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
                  failedCalls.push({ call, error: errorMessage });
                }
              }
              
              console.log("📊 Function calls summary:", `${successfulCalls.length}/${Object.keys(functionCalls).length} completed successfully`);
            }
          }

          // Send done event and close
          const doneData = {
            type: "response_done",
            response_id: responseId,
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(doneData)}\n\n`));
          controller.close();
        } catch (error) {
          console.error("❌ Error in onboarding stream:", error);
          // Encoder might not be initialized if error happens before stream starts
          const encoder = new TextEncoder();
          const errorData = {
            type: "error",
            message: "An unexpected error occurred during the stream.",
            details: error instanceof Error ? error.message : String(error)
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
          controller.close();
        }
      },
    });

    console.log("🚀 Returning onboarding responses stream");
    return new NextResponse(readable, { headers });

  } catch (error) {
    console.error('❌ Onboarding responses stream function error:', error);
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      context: 'onboarding_responses_stream'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
} 