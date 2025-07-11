import OpenAI from "openai";
import { AsyncMemoryManager } from "../memory-manager";
import {
  RequestBody,
  ConversationMessage,
  MCPConfig,
  UserContext,
  Tool,
} from "../types/index";
import { LLMConfig, memoryEnabled } from "../config/index";
import { STREAM_CONSTANTS } from "../constants/index";
import {
  processMemoryContext,
  processMemoryExtraction,
} from "../handlers/memory-handler";
import { prepareUserContext } from "../utils/context";
import {
  functionTools,
  getToolsInfo,
  getMcpToolsInfo,
} from "../tools/definitions";
import { generateSystemPrompt } from "../prompts/system-prompt";
import { Message } from "openai/resources/beta/threads/messages.mjs";
import { aiStreamingService } from "@/lib/services/ai-streaming.service";

/**
 * Main orchestrator service for AI Advisor stream processing
 * Handles the complete flow from request to response
 */
export class AIAdvisorOrchestratorService {
  private openaiClient: OpenAI;
  private memoryManager: AsyncMemoryManager | null;
  private mcpConfig: MCPConfig;

  constructor(
    openaiClient: OpenAI,
    memoryManager: AsyncMemoryManager | null,
    mcpConfig: MCPConfig
  ) {
    this.openaiClient = openaiClient;
    this.memoryManager = memoryManager;
    this.mcpConfig = mcpConfig;

    console.log("🎯 AIAdvisorOrchestratorService initialized:", {
      hasOpenAIClient: !!this.openaiClient,
      hasMemoryManager: !!this.memoryManager,
      memoryEnabled,
      mcpEnabled: this.mcpConfig.enabled,
    });
  }

  /**
   * Process AI advisor request and create stream response
   */
  async processRequest(
    requestBody: RequestBody,
    llmConfig: LLMConfig
  ): Promise<ReadableStream> {
    console.log("🔄 Orchestrator.processRequest started");

    const { message, conversationHistory, userContext, user_id, provider } =
      requestBody;

    console.log("🚀 AI Advisor Stream Function Called");
    console.log("👤 User ID:", user_id);
    console.log("🤖 LLM Provider:", provider || llmConfig.provider);
    console.log("📝 Message:", message);
    console.log("💬 History Length:", conversationHistory?.length || 0);
    console.log("🧠 Memory Enabled:", memoryEnabled && !!this.memoryManager);

    console.log("📊 Request validation in orchestrator:", {
      hasMessage: !!message,
      messageType: typeof message,
      messageLength: message ? message.length : 0,
      hasUserId: !!user_id,
      userIdType: typeof user_id,
      hasConversationHistory: !!conversationHistory,
      conversationHistoryType: typeof conversationHistory,
      isArrayHistory: Array.isArray(conversationHistory),
      hasUserContext: !!userContext,
      userContextType: typeof userContext,
    });

    // Process memory context (with fallback)
    console.log("🧠 Starting memory context processing...");
    let memoryContext = "";
    if (memoryEnabled && this.memoryManager) {
      try {
        const memoryHistoryForMemory = (conversationHistory || []).map(
          (msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.content,
          })
        );

        console.log("🔄 Processing memory with history:", {
          historyItems: memoryHistoryForMemory.length,
          sampleItem: memoryHistoryForMemory[0] || "none",
        });

        memoryContext = await processMemoryContext(
          this.memoryManager,
          message,
          memoryHistoryForMemory,
          user_id
        );

        console.log("✅ Memory context processed:", {
          contextLength: memoryContext.length,
          contextPreview: memoryContext.substring(0, 100) + "...",
        });
      } catch (error) {
        console.warn(
          "⚠️ Memory context failed, continuing without memory:",
          error
        );
        memoryContext = "";
      }
    } else {
      console.log("ℹ️ Memory is disabled or not available");
    }

    // Prepare contexts
    console.log("📋 Preparing contexts...");
    const contexts = this.prepareContexts(
      userContext,
      user_id,
      conversationHistory || [],
      memoryContext
    );

    // Setup tools (simplified without MCP for now)
    console.log("🛠️ Setting up tools...");
    const allTools = functionTools;
    console.log("🛠️ Tools configured:", {
      toolCount: allTools.length,
      toolNames: allTools.map((tool: Tool) => tool.type),
    });

    // Generate system prompt
    console.log("📝 Generating system prompt...");
    const systemPrompt = generateSystemPrompt(
      user_id,
      contexts.combined,
      getToolsInfo(),
      getMcpToolsInfo()
    );

    console.log("📝 System prompt generated:", {
      promptLength: systemPrompt.length,
      promptPreview: systemPrompt.substring(0, 200) + "...",
    });

    // Prepare messages
    console.log("💬 Preparing messages for LLM...");
    const messages = this.prepareMessages(
      systemPrompt,
      conversationHistory || [],
      message
    );

    console.log("💬 Messages prepared:", {
      messageCount: messages.length,
      messageTypes: messages.map((m) => m.role),
      totalLength: messages.reduce((sum, m) => sum + m.content.length, 0),
    });

    // Process OpenAI stream (simplified - only OpenAI for now)
    console.log("🌊 Starting OpenAI stream processing...");
    return this.processOpenAIStream(
      messages as unknown as Message[],
      allTools,
      llmConfig,
      conversationHistory || [],
      message,
      user_id
    );

    console.log("✅ Orchestrator.processRequest completed");
  }

  /**
   * Prepare all context information
   */
  private prepareContexts(
    userContext: UserContext,
    userId: string,
    conversationHistory: ConversationMessage[],
    memoryContext: string
  ) {
    console.log("📋 Preparing user context...");
    const userContextInfo = prepareUserContext(userContext, userId, "");

    const combined = [memoryContext, userContextInfo]
      .filter(Boolean)
      .join("\n\n");

    console.log("📚 Context Debug:", {
      historyLength: conversationHistory.length,
      userContextLength: userContextInfo.length,
      memoryContextLength: memoryContext.length,
      combinedContextLength: combined.length,
    });

    return {
      combined,
      user: userContextInfo,
      memory: memoryContext,
    };
  }

  /**
   * Prepare messages for LLM
   */
  private prepareMessages(
    systemPrompt: string,
    conversationHistory: ConversationMessage[],
    currentMessage: string
  ) {
    console.log("💬 Building message array...");

    // Clean approach: Use only structured format for conversation history
    // No embedding history into user message to avoid duplication

    const historyMessages = conversationHistory
      .slice(-STREAM_CONSTANTS.MAX_HISTORY_MESSAGES)
      .map((msg: ConversationMessage) => ({
        role:
          msg.sender === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      }));

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...historyMessages,
      { role: "user" as const, content: currentMessage },
    ];

    console.log("💬 Message array built:", {
      systemPromptLength: systemPrompt.length,
      historyCount: historyMessages.length,
      currentMessageLength: currentMessage.length,
      totalMessages: messages.length,
    });

    return messages;
  }

  /**
   * Safely parse function call arguments with comprehensive validation and error handling
   */
  private parseToolArguments(
    callId: string,
    argumentsStr: string
  ): Record<string, unknown> {
    // Trim whitespace and check for empty string
    const trimmedArgs = argumentsStr.trim();

    if (!trimmedArgs) {
      console.log(
        `🔧 Empty arguments for call ${callId}, using default empty object`
      );
      return {};
    }

    // Check if it looks like JSON (starts with { and ends with })
    if (!trimmedArgs.startsWith("{") || !trimmedArgs.endsWith("}")) {
      console.warn(`⚠️ Arguments for call ${callId} don't look like JSON:`, {
        length: trimmedArgs.length,
        starts_with: trimmedArgs.substring(0, 10),
        ends_with: trimmedArgs.substring(Math.max(0, trimmedArgs.length - 10)),
        full_args:
          trimmedArgs.length < 200
            ? trimmedArgs
            : `${trimmedArgs.substring(0, 100)}...${trimmedArgs.substring(
                trimmedArgs.length - 100
              )}`,
      });
      return {};
    }

    try {
      // Attempt to parse the JSON
      const parsed = JSON.parse(trimmedArgs);

      // Validate that it's an object
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        console.warn(
          `⚠️ Parsed arguments for call ${callId} is not a valid object:`,
          typeof parsed
        );
        return {};
      }

      console.log(
        `✅ Successfully parsed arguments for call ${callId}:`,
        Object.keys(parsed)
      );
      return parsed as Record<string, unknown>;
    } catch (error) {
      console.error(`❌ JSON parsing failed for call ${callId}:`, {
        error: error instanceof Error ? error.message : String(error),
        argumentsLength: trimmedArgs.length,
        argumentsPreview:
          trimmedArgs.length < 200
            ? trimmedArgs
            : `${trimmedArgs.substring(0, 100)}...${trimmedArgs.substring(
                trimmedArgs.length - 100
              )}`,
        startsWithBrace: trimmedArgs.startsWith("{"),
        endsWithBrace: trimmedArgs.endsWith("}"),
      });

      // Try to extract any valid JSON-like properties as fallback
      try {
        const fallbackData = this.extractFallbackData(trimmedArgs);
        if (Object.keys(fallbackData).length > 0) {
          console.log(
            `🔄 Using fallback data extraction for call ${callId}:`,
            Object.keys(fallbackData)
          );
          return fallbackData;
        }
      } catch (fallbackError) {
        console.warn(
          `⚠️ Fallback extraction also failed for call ${callId}:`,
          fallbackError
        );
      }

      return {};
    }
  }

  /**
   * Attempt to extract data from malformed JSON as a fallback
   */
  private extractFallbackData(invalidJson: string): Record<string, unknown> {
    const fallbackData: Record<string, unknown> = {};

    // Try to extract common patterns using regex
    const patterns = [
      { key: "component_id", regex: /"component_id"\s*:\s*"([^"]+)"/i },
      { key: "tool_id", regex: /"tool_id"\s*:\s*"([^"]+)"/i },
      { key: "title", regex: /"title"\s*:\s*"([^"]+)"/i },
      { key: "context", regex: /"context"\s*:\s*({[^}]*})/i },
    ];

    for (const pattern of patterns) {
      const match = invalidJson.match(pattern.regex);
      if (match && match[1]) {
        try {
          if (pattern.key === "context") {
            fallbackData[pattern.key] = JSON.parse(match[1]);
          } else {
            fallbackData[pattern.key] = match[1];
          }
        } catch {
          // Skip this field if parsing fails
        }
      }
    }

    return fallbackData;
  }

  /**
   * Process OpenAI stream using standard chat completions
   */
  private async processOpenAIStream(
    messages: Message[],
    allTools: Tool[],
    llmConfig: LLMConfig,
    conversationHistory: ConversationMessage[],
    message: string,
    userId: string
  ): Promise<ReadableStream> {
    console.log("🤖 Using OpenAI streaming...");
    console.log("🔧 OpenAI request config:", {
      model: llmConfig.model,
      temperature: llmConfig.temperature,
      messageCount: Array.isArray(messages) ? messages.length : 0,
      toolCount: Array.isArray(allTools) ? allTools.length : 0,
      hasApiKey: !!llmConfig.apiKey,
    });

    console.log("🔧 All tools:", JSON.stringify(allTools));

    try {
      console.log("📡 Creating OpenAI stream...");
      const stream = await this.openaiClient.responses.create({
        model: llmConfig.model,
        input: messages,
        tools: allTools,
        stream: true,
        temperature: llmConfig.temperature,
      });

      console.log("🌊 OpenAI stream created successfully");

      return aiStreamingService.createReadableStream(stream, {
        onResponsesCompleted: async (responseContent) => {
          if (memoryEnabled && this.memoryManager) {
            try {
              console.log("🧠 Starting background memory extraction...");
              const memoryHistory = conversationHistory.map((msg) => ({
                role: msg.sender === "user" ? "user" : "assistant",
                content: msg.content,
              }));

              await processMemoryExtraction(
                this.memoryManager,
                memoryHistory,
                responseContent,
                message,
                userId
              );
              console.log("✅ Memory extraction completed");
            } catch (error) {
              console.warn("⚠️ Memory extraction failed:", error);
            }
          }
        },
      });
    } catch (error) {
      console.error("❌ OpenAI streaming error:", error);
      console.error("❌ Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "No stack",
      });
      throw error; // Re-throw to be caught by the outer try-catch
    }
  }
}
