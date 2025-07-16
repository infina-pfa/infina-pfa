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
import { financialOverviewService } from "./financial-overview.service";

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

    const { message, conversationHistory, user_id, provider } = requestBody;

    const financialOverviewResponse =
      await financialOverviewService.getFinancialOverview(user_id);

    // Define the expected financial data type
    type FinancialOverviewData = {
      month: number;
      year: number;
      totalIncome: number;
      totalExpense: number;
      balance: number;
      budgets: {
        items: Array<{
          id: string;
          name: string;
          category: string;
          amount: number;
          spent: number;
          remaining: number;
        }>;
        total: number;
        spent: number;
        remaining: number;
      };
    };

    // Check if we have valid data and transform it
    let financialData: UserContext["financial"] = undefined;

    if (
      financialOverviewResponse &&
      typeof financialOverviewResponse === "object" &&
      !("success" in financialOverviewResponse) &&
      financialOverviewResponse !== null
    ) {
      const data = financialOverviewResponse as FinancialOverviewData;

      financialData = {
        totalIncome: data.totalIncome || 0,
        totalExpenses: data.totalExpense || 0,
        totalCurrentMonthIncome: data.totalIncome || 0,
        totalCurrentMonthExpenses: data.totalExpense || 0,
        currentBudgets: data.budgets?.items?.length || 0,
        budgetCategories: data.budgets?.items?.map((b) => b.category) || [],
        budgets:
          data.budgets?.items?.map((budget) => ({
            id: budget.id,
            name: budget.name,
            budgeted: budget.amount,
            spent: budget.spent,
          })) || [],
      };
    }

    const userContext = {
      financial: financialData,
    };
    console.log(
      "🚀 ~ AIAdvisorOrchestratorService ~ userContext.financialData:",
      financialData
    );

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
