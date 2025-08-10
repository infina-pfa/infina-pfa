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
import { Message } from "openai/resources/beta/threads/messages.mjs";
import { aiStreamingService } from "@/lib/services-v2/ai-streaming.service";
import {
  financialOverviewService,
  FinancialOverviewData,
} from "./financial-overview.service";
import { BudgetStyle, FinancialStage, User } from "@/lib/types/user.types";
import { DynamicOrchestrator } from "../config/orchestrator";

/**
 * Main orchestrator service for AI Advisor stream processing
 * Handles the complete flow from request to response
 */
export class AIAdvisorOrchestratorService {
  private user: User;
  private openaiClient: OpenAI;
  private memoryManager: AsyncMemoryManager | null;
  private mcpConfig: MCPConfig;

  constructor(
    user: User,
    openaiClient: OpenAI,
    memoryManager: AsyncMemoryManager | null,
    mcpConfig: MCPConfig
  ) {
    this.user = user;
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
        // All-time totals
        pyfAmount: data.pyfAmount || 0,
        totalIncome: data.allTime?.totalIncome || 0,
        totalExpenses: data.allTime?.totalExpense || 0,
        // Current month totals
        totalCurrentMonthIncome: data.currentMonth?.totalIncome || 0,
        totalCurrentMonthExpenses: data.currentMonth?.totalExpense || 0,
        // Budget info
        currentBudgets: data.budgets?.items?.length || 0,
        budgetCategories: data.budgets?.items?.map((b) => b.category) || [],
        budgets:
          data.budgets?.items?.map((budget) => ({
            id: budget.id,
            name: budget.name,
            budgeted: budget.amount,
            spent: budget.spent,
            category: budget.category,
          })) || [],
        // Goals info
        goals: {
          totalGoals: data.goals?.stats?.totalGoals || 0,
          completedGoals: data.goals?.stats?.completedGoals || 0,
          upcomingGoals: data.goals?.stats?.upcomingGoals || 0,
          totalSaved: data.goals?.stats?.totalSaved || 0,
          totalTarget: data.goals?.stats?.totalTarget || 0,
          averageCompletion: data.goals?.stats?.averageCompletion || 0,
          activeGoals:
            data.goals?.items?.map((goal) => ({
              id: goal.id,
              title: goal.title,
              currentAmount: goal.currentAmount,
              targetAmount: goal.targetAmount,
              progressPercentage: goal.progressPercentage,
              isCompleted: goal.isCompleted || false,
              isDueSoon: goal.isDueSoon,
              dueDate: goal.dueDate,
            })) || [],
        },
      };
    }

    const userContext = {
      financial: financialData,
    };
    // console.log(
    //   "🚀 ~ AIAdvisorOrchestratorService ~ userContext.financialData:",
    //   financialData
    // ); // Removed excessive financial data logging

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

    // Get user's financial stage and budget style
    const userStage = this.user.financial_stage as FinancialStage;
    const userBudgetStyle = this.user.budgeting_style as BudgetStyle;

    console.log("🎯 User stage and style:", {
      financialStage: userStage,
      budgetStyle: userBudgetStyle,
    });

    // Use dynamic orchestrator to get configuration
    const llmConfiguration = DynamicOrchestrator.getLLMConfiguration(
      userStage,
      userBudgetStyle,
      contexts.combined
    );

    console.log("🛠️ Dynamic tools configured:", {
      toolCount: llmConfiguration.tools.length,
      chatTools: llmConfiguration.stageTools.chatTools,
      componentTools: llmConfiguration.stageTools.componentTools,
      mcpTools: llmConfiguration.stageTools.mcpTools,
    });

    // Generate system prompt using dynamic orchestrator
    const systemPrompt = DynamicOrchestrator.getSystemPrompt(
      user_id,
      userStage,
      userBudgetStyle,
      {
        memory: memoryContext,
        user: contexts.user,
        financial: JSON.stringify(financialData),
      }
    );

    // Prepare messages
    console.log("💬 Preparing messages for LLM...");
    const messages = this.prepareMessages(
      systemPrompt,
      conversationHistory || [],
      message
    );

    // Process OpenAI stream using dynamic tools
    console.log("🌊 Starting OpenAI stream processing...");
    return this.processOpenAIStream(
      messages as unknown as Message[],
      llmConfiguration.tools,
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

    // console.log("📚 Context Debug:", {
    //   historyLength: conversationHistory.length,
    //   userContextLength: userContextInfo.length,
    //   memoryContextLength: memoryContext.length,
    //   combinedContextLength: combined.length,
    // }); // Commented out to reduce console noise

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

    // console.log("🔧 All tools:", JSON.stringify(allTools));

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
            } catch (error) {
              console.error("⚠️ Memory extraction failed:", error);
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
