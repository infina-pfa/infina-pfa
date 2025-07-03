import { FunctionCall, ResponseDataEvent } from "../types/index.ts";
import { BaseStreamHandler } from "./base-stream-handler.ts";
import { FunctionCallProcessor } from "./function-call.processor.ts";
import { LLMMetadataService } from "../services/llm-metadata.service.ts";

interface OpenAIStreamChunk {
  type: string;
  delta?: string;
  item_id?: string;
  item?: {
    id: string;
    type: string;
    name?: string;
    call_id?: string;
    arguments?: string;
    tools?: unknown[];
  };
  response?: {
    id?: string;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      total_tokens?: number;
      input_cached_tokens?: number;
      input_audio_tokens?: number;
      output_audio_tokens?: number;
      reasoning_tokens?: number;
    };
  };
}

class OpenAIStreamHandler extends BaseStreamHandler {
  private functionCallProcessor = new FunctionCallProcessor();
  private metadataService = LLMMetadataService.getInstance();
  private latencyTracker: { getLatency: () => number } | null = null;
  private model = '';
  private userId = '';
  private requestId = '';

  public handleResponseCreated(chunk: OpenAIStreamChunk): void {
    if (chunk.type === "response.created" && chunk.response?.id) {
      this.sendEvent({
        type: ResponseDataEvent.RESPONSE_CREATED,
        response_id: chunk.response.id,
        timestamp: new Date().toISOString(),
      });
    }
  }

  public handleContentDelta(chunk: OpenAIStreamChunk): void {
    if (chunk.type === 'response.output_text.delta' && chunk.delta) {
      this.addToResponse(chunk.delta);
      this.sendEvent({
        type: ResponseDataEvent.OUTPUT_TEXT_STREAMING,
        content: chunk.delta,
        timestamp: new Date().toISOString(),
      });
    }

    if (chunk.type === "response.output_text.done") {
      this.sendEvent({
        type: ResponseDataEvent.OUTPUT_TEXT_DONE,
        content: this.getResponseContent(),
        timestamp: new Date().toISOString(),
      });
    }
  }

  public handleFunctionCallArguments(chunk: OpenAIStreamChunk): void {
    this.functionCallProcessor.handleFunctionCallArgumentsDeltas(chunk, this.sendEvent.bind(this));
    this.functionCallProcessor.handleMCPCallArguments(chunk, this.sendEvent.bind(this));
  }

  public handleFunctionCallCompletion(chunk: OpenAIStreamChunk): void {
    this.functionCallProcessor.handleUIFunctionCallCompletion(chunk, this.sendEvent.bind(this), this.sendError.bind(this));
    this.functionCallProcessor.handleMCPCallCompletion(chunk, this.sendEvent.bind(this));
  }

  public processCompletedFunctionCalls(chunk: OpenAIStreamChunk): void {
    console.log("✅ Response completed - Processing function calls:", Object.keys(this.functionCallProcessor.getFunctionCalls()).length);
    
    // Extract and log metadata
    const usage = this.metadataService.extractOpenAIUsage(chunk);
    if (usage && this.latencyTracker) {
      const metadata = this.metadataService.createMetadata(
        'openai',
        this.model,
        usage,
        this.latencyTracker.getLatency(),
        {
          user_id: this.userId,
          request_id: this.requestId,
          finish_reason: 'completed'
        }
      );
      this.metadataService.logMetadata(metadata);
    }
    
    this.sendEvent({
      type: ResponseDataEvent.RESPONSE_COMPLETED,
      finish_reason: "completed",
      timestamp: new Date().toISOString(),
    });
  }

  public getFunctionCalls(): { [key: string]: FunctionCall } {
    return this.functionCallProcessor.getFunctionCalls();
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
}

export function createStreamHandler(controller: ReadableStreamDefaultController): OpenAIStreamHandler {
  return new OpenAIStreamHandler(controller);
} 