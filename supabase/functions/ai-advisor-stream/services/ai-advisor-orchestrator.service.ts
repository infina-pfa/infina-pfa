import OpenAI from "npm:openai";
import { AsyncMemoryManager } from "../memory-manager.ts";
import { RequestBody, ConversationMessage, MCPConfig, UserContext } from "../types/index.ts";
import { LLMConfig } from "../config/index.ts";
import { STREAM_CONSTANTS, ERROR_MESSAGES } from "../constants/index.ts";
import { processMemoryContext, processMemoryExtraction } from "../handlers/memory-handler.ts";
import { prepareUserContext } from "../utils/context.ts";
import { functionTools, getToolsInfo, getMcpToolsInfo } from "../tools/definitions.ts";
import { generateSystemPrompt } from "../prompts/system-prompt.ts";
import { setupMCPTools } from "../handlers/mcp-setup.ts";
import { createStreamHandler } from "../handlers/openai-stream-handler.ts";
import { GeminiClient } from "../handlers/gemini-client.ts";
import { createGeminiStreamHandler } from "../handlers/gemini-stream-handler.ts";
import { TokenEstimator } from "../utils/token-estimator.ts";

/**
 * Main orchestrator service for AI Advisor stream processing
 * Handles the complete flow from request to response
 */
export class AIAdvisorOrchestratorService {
  private openaiClient: OpenAI;
  private memoryManager: AsyncMemoryManager;
  private mcpConfig: MCPConfig;

  constructor(
    openaiClient: OpenAI,
    memoryManager: AsyncMemoryManager,
    mcpConfig: MCPConfig
  ) {
    this.openaiClient = openaiClient;
    this.memoryManager = memoryManager;
    this.mcpConfig = mcpConfig;
  }

  /**
   * Process AI advisor request and create stream response
   */
  async processRequest(
    requestBody: RequestBody,
    llmConfig: LLMConfig,
    controller: ReadableStreamDefaultController
  ): Promise<void> {
    const { message, conversationHistory, userContext, user_id, provider } = requestBody;

    console.log("🚀 AI Advisor Stream Function Called");
    console.log("👤 User ID:", user_id);
    console.log("🤖 LLM Provider:", provider || llmConfig.provider);
    console.log("📝 Message:", message);
    console.log("💬 History Length:", conversationHistory?.length || 0);

    // Process memory context
    const memoryContext = await processMemoryContext(
      this.memoryManager,
      message,
      conversationHistory || [],
      user_id
    );

    // Prepare contexts
    const contexts = this.prepareContexts(
      userContext,
      user_id,
      conversationHistory || [],
      memoryContext
    );

    // Setup tools
    const allTools = await setupMCPTools(this.mcpConfig, functionTools);

    // Generate system prompt
    const systemPrompt = generateSystemPrompt(
      user_id,
      contexts.combined,
      getToolsInfo(),
      getMcpToolsInfo()
    );

    // Prepare messages
    const messages = this.prepareMessages(
      systemPrompt,
      conversationHistory || [],
      message
    );

    // Process stream based on provider
    if (llmConfig.provider === 'gemini') {
      await this.processGeminiStream(
        messages,
        allTools,
        llmConfig,
        controller,
        conversationHistory || [],
        message,
        user_id
      );
    } else {
      await this.processOpenAIStream(
        messages,
        allTools,
        llmConfig,
        controller,
        conversationHistory || [],
        message,
        user_id
      );
    }
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
    const userContextInfo = prepareUserContext(userContext, userId, "");
    
    const combined = [
      memoryContext,
      userContextInfo
    ].filter(Boolean).join('\\n\\n');

    console.log("📚 Context Debug:", {
      historyLength: conversationHistory.length,
      userContextLength: userContextInfo.length,
      memoryContextLength: memoryContext.length,
      combinedContextLength: combined.length
    });

    return {
      combined,
      user: userContextInfo,
      memory: memoryContext
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
    // Clean approach: Use only structured format for conversation history
    // No embedding history into user message to avoid duplication
    
    return [
      { role: "system" as const, content: systemPrompt },
      ...conversationHistory
        .slice(-STREAM_CONSTANTS.MAX_HISTORY_MESSAGES)
        .map((msg: ConversationMessage) => ({
          role: msg.sender === "user" ? ("user" as const) : ("assistant" as const),
          content: msg.content,
        })),
      { role: 'user' as const, content: currentMessage }
    ];
  }

  /**
   * Process Gemini stream
   */
  private async processGeminiStream(
    messages: unknown[],
    allTools: unknown[],
    llmConfig: LLMConfig,
    controller: ReadableStreamDefaultController,
    conversationHistory: ConversationMessage[],
    message: string,
    userId: string
  ): Promise<void> {
    const geminiClient = new GeminiClient(llmConfig);
    
    const functionToolsOnly = allTools.filter(tool => 
      typeof tool === 'object' && tool !== null && 
      'type' in tool && (tool as unknown as Record<string, unknown>).type === 'function'
    );
    
    const streamHandler = createGeminiStreamHandler(controller);
    
    // Initialize metadata tracking
    const requestId = `req_gemini_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    streamHandler.initializeMetadataTracking(llmConfig.model, userId, requestId);
    
    // Estimate input tokens for Gemini (since streaming doesn't provide real-time counts)
    const messagesForTokenEstimation = messages as { role: string; content: string; }[];
    const estimatedInputTokens = TokenEstimator.estimateInputTokensFromMessages(messagesForTokenEstimation);
    
    console.log("🤖 Using Gemini 2.5 Flash streaming...");
    console.log("🛠️ Function tools available:", functionToolsOnly.length);
    console.log("📊 Estimated input tokens:", estimatedInputTokens);
    
    const stream = await geminiClient.generateContentStream(messagesForTokenEstimation, functionToolsOnly);
    
    let hasProcessedChunks = false;
    let lastFinishReason: string | null = null;
    let streamEnded = false;
    
    try {
      for await (const chunk of stream) {
        if (!chunk) continue;
        
        hasProcessedChunks = true;
        
        if (chunk.candidates?.[0]?.finishReason) {
          lastFinishReason = chunk.candidates[0].finishReason;
          console.log("🔄 Detected finishReason in chunk:", lastFinishReason);
        }
        
        streamHandler.handleGeminiChunk(chunk);
      }
      
          console.log("✅ Gemini stream loop completed naturally");
    console.log("✅ Total response content length:", streamHandler.getResponseContent().length);
    console.log("✅ Final finish reason:", lastFinishReason);
    
    // Set estimated token counts for metadata logging
    const responseContent = streamHandler.getResponseContent();
    const estimatedOutputTokens = TokenEstimator.estimateTokensAdvanced(responseContent);
    streamHandler.setEstimatedTokenCounts(estimatedInputTokens, estimatedOutputTokens);
    
    console.log("📊 Estimated output tokens:", estimatedOutputTokens);
    console.log("📊 Total estimated tokens:", estimatedInputTokens + estimatedOutputTokens);
      
    } catch (streamError) {
      console.error("❌ Error during Gemini streaming:", streamError);
      if (!streamEnded) {
        streamHandler.sendError(streamError);
        streamEnded = true;
      }
      return;
    }

    if (hasProcessedChunks && !streamEnded) {
      console.log("🏁 Ending Gemini stream...");
      streamHandler.endStream();
      streamEnded = true;
    } else if (!hasProcessedChunks && !streamEnded) {
      console.warn("⚠️ No chunks processed, ending stream with error");
      streamHandler.sendError(new Error("No content received from Gemini"));
      streamEnded = true;
    }

    // Process memory extraction in background
    await processMemoryExtraction(
      this.memoryManager,
      conversationHistory,
      streamHandler.getResponseContent(),
      message,
      userId
    );
  }

  /**
   * Process OpenAI stream
   */
  private async processOpenAIStream(
    messages: unknown[],
    allTools: unknown[],
    llmConfig: LLMConfig,
    controller: ReadableStreamDefaultController,
    conversationHistory: ConversationMessage[],
    message: string,
    userId: string
  ): Promise<void> {
    console.log("🤖 Using OpenAI streaming...");
    
    const stream = await this.openaiClient.responses.create({
      model: llmConfig.model,
      input: messages,
      tools: allTools,
      stream: true,
      temperature: llmConfig.temperature
    });
    
    const streamHandler = createStreamHandler(controller);
    
    // Initialize metadata tracking
    const requestId = `req_openai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    streamHandler.initializeMetadataTracking(llmConfig.model, userId, requestId);
    
    for await (const chunk of stream) {
      if (!chunk || typeof chunk !== 'object') {
        continue;
      }
      
      streamHandler.handleResponseCreated(chunk);
      streamHandler.handleContentDelta(chunk);
      streamHandler.handleFunctionCallArguments(chunk);
      streamHandler.handleFunctionCallCompletion(chunk);
      
      if (chunk.type === 'response.completed') {
        streamHandler.processCompletedFunctionCalls(chunk);
        break;
      }
    }
    
    console.log("✅ OpenAI stream finished. Full response content:", streamHandler.getResponseContent());

    // Process memory extraction in background
    await processMemoryExtraction(
      this.memoryManager,
      conversationHistory,
      streamHandler.getResponseContent(),
      message,
      userId
    );
    
    streamHandler.endStream();
  }
} 