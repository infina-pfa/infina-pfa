import { GeminiStreamChunk } from "../types/index.ts";
import { BaseStreamHandler } from "./base-stream-handler.ts";
import { UIActionService } from "../services/ui-action.service.ts";
import { LLMMetadataService } from "../services/llm-metadata.service.ts";

class GeminiStreamHandler extends BaseStreamHandler {
  private currentMessageSegment = 1;
  private hasActiveToolCall = false;
  private functionCalls: Record<string, { 
    name: string; 
    arguments: Record<string, unknown>; 
    complete: boolean 
  }> = {};
  private metadataService = LLMMetadataService.getInstance();
  private latencyTracker: { getLatency: () => number } | null = null;
  private model = '';
  private userId = '';
  private requestId = '';
  private totalInputTokens = 0;
  private totalOutputTokens = 0;

  public handleGeminiChunk(chunk: GeminiStreamChunk): void {
    if (this.streamEnded) {
      console.log("⚠️ Attempted to process chunk after stream ended");
      return;
    }

    if (!chunk.candidates || chunk.candidates.length === 0) {
      return;
    }

    const candidate = chunk.candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      return;
    }

    for (const part of candidate.content.parts) {
      // Handle text content
      if (part.text) {
        this.addToResponse(part.text);
        this.sendContentEvent('content', part.text, {
          messageSegment: this.currentMessageSegment
        });
      }

      // Handle function calls (UI tools only)
      if (part.functionCall) {
        this.handleFunctionCall(part.functionCall);
      }
    }

    if (candidate.finishReason) {
      console.log("✅ Gemini finishReason detected:", candidate.finishReason);
      this.logGeminiMetadata(candidate.finishReason, chunk);
    }
  }

  private handleFunctionCall(functionCall: { name: string; args: Record<string, unknown> }): void {
    if (!this.hasActiveToolCall) {
      this.hasActiveToolCall = true;
      console.log(`✅ DETECTED GEMINI TOOL CALL: ${functionCall.name}`);
      
      this.sendEvent({
        type: 'message_segment_break',
        reason: 'tool_call_start',
        timestamp: new Date().toISOString(),
        currentSegment: this.currentMessageSegment,
        toolCallType: 'gemini_function_call'
      });
      
      this.currentMessageSegment++;
      
      this.sendEvent({
        type: 'tool_call_started',
        timestamp: new Date().toISOString(),
        messageSegment: this.currentMessageSegment
      });
    }

    // Store function call
    const callId = `gemini_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.functionCalls[callId] = {
      name: functionCall.name,
      arguments: functionCall.args,
      complete: true
    };

    console.log(`🔧 Gemini Function Call Ready: ${functionCall.name}`);
    
    this.sendEvent({
      type: 'tool_execution_complete',
      toolName: functionCall.name,
      timestamp: new Date().toISOString(),
      messageSegment: this.currentMessageSegment
    });
    
    this.processGeminiFunctionCall(functionCall.name, functionCall.args);
    
    this.hasActiveToolCall = false;
    this.currentMessageSegment++;
  }

  private processGeminiFunctionCall(functionName: string, args: Record<string, unknown>): void {
    console.log(`🔧 Processing Gemini function call: ${functionName}`, args);
    
    try {
      const uiAction = UIActionService.processGeminiFunctionCall(functionName, args);
      const actionEvent = UIActionService.createUIActionEvent(uiAction, this.currentMessageSegment, 'gemini');
      
      this.sendEvent(actionEvent);
      console.log(`✅ UI action ${functionName} sent to stream`);
    } catch (error) {
      console.error(`❌ Error processing UI function ${functionName}:`, error);
      const errorEvent = UIActionService.createUIActionError(
        functionName, 
        error instanceof Error ? error.message : 'Unknown error',
        this.currentMessageSegment
      );
      this.sendEvent(errorEvent);
    }
  }

  /**
   * Initialize metadata tracking for the request
   */
  public initializeMetadataTracking(model: string, userId: string, requestId?: string): void {
    this.model = model;
    this.userId = userId;
    this.requestId = requestId || `req_${Date.now()}`;
    this.latencyTracker = this.metadataService.createLatencyTracker();
  }

  /**
   * Log Gemini metadata when stream completes
   * Note: Gemini streaming doesn't provide detailed token usage per chunk
   */
  private logGeminiMetadata(finishReason: string, chunk?: GeminiStreamChunk): void {
    if (this.latencyTracker) {
      // For Gemini, we need to estimate token usage or get it from the final response
      // Since streaming API doesn't provide detailed token counts, we use estimates
      const usage = this.metadataService.extractGeminiUsage(chunk as any) || {
        prompt_tokens: this.totalInputTokens,
        completion_tokens: this.totalOutputTokens,
        total_tokens: this.totalInputTokens + this.totalOutputTokens,
      };

      const metadata = this.metadataService.createMetadata(
        'gemini',
        this.model,
        usage,
        this.latencyTracker.getLatency(),
        {
          user_id: this.userId,
          request_id: this.requestId,
          finish_reason: finishReason
        }
      );
      
      this.metadataService.logMetadata(metadata);
    }
  }

  /**
   * Set estimated token counts for Gemini (since streaming doesn't provide real-time counts)
   */
  public setEstimatedTokenCounts(inputTokens: number, outputTokens: number): void {
    this.totalInputTokens = inputTokens;
    this.totalOutputTokens = outputTokens;
  }
}

export function createGeminiStreamHandler(controller: ReadableStreamDefaultController): GeminiStreamHandler {
  return new GeminiStreamHandler(controller);
} 