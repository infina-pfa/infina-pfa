/**
 * Service for tracking and logging LLM metadata
 * Handles token usage, cost calculation, and performance metrics
 */

interface LLMUsageMetadata {
  provider: 'openai' | 'gemini';
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cached_tokens?: number;
  audio_input_tokens?: number;
  audio_output_tokens?: number;
  reasoning_tokens?: number;
  cost_usd?: number;
  latency_ms: number;
  timestamp: string;
  user_id?: string;
  request_id?: string;
  finish_reason?: string;
}

interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cached_tokens?: number;
  audio_input_tokens?: number;
  audio_output_tokens?: number;
  reasoning_tokens?: number;
}

interface OpenAIResponseChunk {
  response?: {
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

interface GeminiResponse {
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

/**
 * OpenAI pricing per 1M tokens (as of 2024)
 * Reference: https://openai.com/pricing
 */
const OPENAI_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gpt-4o-2024-08-06': { input: 2.50, output: 10.00 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4o-mini-2024-07-18': { input: 0.15, output: 0.60 },
  'gpt-4.1-2025-04-14': { input: 2.00, output: 8.00 },
  'gpt-4.1-mini-2025-04-14': { input: 0.40, output: 1.60 },
  'gpt-4-turbo': { input: 10.00, output: 30.00 },
  'gpt-4': { input: 30.00, output: 60.00 },
  'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
  'o1-preview': { input: 15.00, output: 60.00 },
  'o1-mini': { input: 3.00, output: 12.00 },
  'o1-mini-2024-09-12': { input: 3.00, output: 12.00 },
};

/**
 * Gemini pricing per 1M tokens (estimated)
 * Reference: https://cloud.google.com/vertex-ai/pricing
 */
const GEMINI_PRICING: Record<string, { input: number; output: number }> = {
  'gemini-2.0-flash-exp': { input: 0.075, output: 0.30 },
  'gemini-2.5-flash': { input: 0.3, output: 2.50 },
  'gemini-1.5-flash': { input: 0.075, output: 0.30 },
  'gemini-1.5-pro': { input: 1.25, output: 5.00 },
};

export class LLMMetadataService {
  private static instance: LLMMetadataService;

  public static getInstance(): LLMMetadataService {
    if (!LLMMetadataService.instance) {
      LLMMetadataService.instance = new LLMMetadataService();
    }
    return LLMMetadataService.instance;
  }

  /**
   * Calculate cost for OpenAI usage
   */
  private calculateOpenAICost(model: string, usage: TokenUsage): number {
    const pricing = OPENAI_PRICING[model] || OPENAI_PRICING['gpt-4o-mini']; // fallback
    
    const inputCost = (usage.prompt_tokens / 1_000_000) * pricing.input;
    const outputCost = (usage.completion_tokens / 1_000_000) * pricing.output;
    
    // Cached tokens typically cost less (50% discount common)
    const cachedDiscount = usage.cached_tokens ? (usage.cached_tokens / 1_000_000) * pricing.input * 0.5 : 0;
    
    return inputCost + outputCost - cachedDiscount;
  }

  /**
   * Calculate cost for Gemini usage
   */
  private calculateGeminiCost(model: string, usage: TokenUsage): number {
    const pricing = GEMINI_PRICING[model] || GEMINI_PRICING['gemini-2.0-flash-exp']; // fallback
    
    const inputCost = (usage.prompt_tokens / 1_000_000) * pricing.input;
    const outputCost = (usage.completion_tokens / 1_000_000) * pricing.output;
    
    return inputCost + outputCost;
  }

  /**
   * Extract usage from OpenAI response chunk
   */
  public extractOpenAIUsage(chunk: OpenAIResponseChunk): TokenUsage | null {
    if (chunk.response?.usage) {
      return {
        prompt_tokens: chunk.response.usage.input_tokens || 0,
        completion_tokens: chunk.response.usage.output_tokens || 0,
        total_tokens: chunk.response.usage.total_tokens || 0,
        cached_tokens: chunk.response.usage.input_cached_tokens || 0,
        audio_input_tokens: chunk.response.usage.input_audio_tokens || 0,
        audio_output_tokens: chunk.response.usage.output_audio_tokens || 0,
        reasoning_tokens: chunk.response.usage.reasoning_tokens || 0,
      };
    }
    return null;
  }

  /**
   * Extract usage from Gemini response
   * Note: Gemini API may not provide detailed token usage in streaming
   */
  public extractGeminiUsage(response: GeminiResponse): TokenUsage | null {
    if (response.usageMetadata) {
      return {
        prompt_tokens: response.usageMetadata.promptTokenCount || 0,
        completion_tokens: response.usageMetadata.candidatesTokenCount || 0,
        total_tokens: response.usageMetadata.totalTokenCount || 0,
      };
    }
    return null;
  }

  /**
   * Create metadata object
   */
  public createMetadata(
    provider: 'openai' | 'gemini',
    model: string,
    usage: TokenUsage,
    latency_ms: number,
    options: {
      user_id?: string;
      request_id?: string;
      finish_reason?: string;
    } = {}
  ): LLMUsageMetadata {
    const cost_usd = provider === 'openai' 
      ? this.calculateOpenAICost(model, usage)
      : this.calculateGeminiCost(model, usage);

    return {
      provider,
      model,
      ...usage,
      cost_usd,
      latency_ms,
      timestamp: new Date().toISOString(),
      ...options,
    };
  }

  /**
   * Log metadata to console and potentially to external services
   */
  public logMetadata(metadata: LLMUsageMetadata): void {
    console.log('📊 LLM Request Metadata:', {
      '🤖 Provider': metadata.provider,
      '🎯 Model': metadata.model,
      '📝 Input Tokens': metadata.prompt_tokens.toLocaleString(),
      '💬 Output Tokens': metadata.completion_tokens.toLocaleString(),
      '🔢 Total Tokens': metadata.total_tokens.toLocaleString(),
      '💰 Cost (USD)': metadata.cost_usd ? `$${metadata.cost_usd.toFixed(4)}` : 'N/A',
      '⏱️ Latency': `${metadata.latency_ms}ms`,
      '👤 User ID': metadata.user_id || 'N/A',
      '🆔 Request ID': metadata.request_id || 'N/A',
      '✅ Finish Reason': metadata.finish_reason || 'N/A',
      '🕐 Timestamp': metadata.timestamp,
    });

    // Additional detailed logging for cached tokens and audio tokens
    if (metadata.cached_tokens && metadata.cached_tokens > 0) {
      console.log(`💾 Cached Tokens: ${metadata.cached_tokens.toLocaleString()}`);
    }
    
    if (metadata.audio_input_tokens && metadata.audio_input_tokens > 0) {
      console.log(`🎤 Audio Input Tokens: ${metadata.audio_input_tokens.toLocaleString()}`);
    }
    
    if (metadata.audio_output_tokens && metadata.audio_output_tokens > 0) {
      console.log(`🔊 Audio Output Tokens: ${metadata.audio_output_tokens.toLocaleString()}`);
    }

    if (metadata.reasoning_tokens && metadata.reasoning_tokens > 0) {
      console.log(`🧠 Reasoning Tokens: ${metadata.reasoning_tokens.toLocaleString()}`);
    }

    // TODO: Send to external logging service (e.g., Supabase, monitoring service)
    this.sendToExternalService(metadata);
  }

  /**
   * Send metadata to external logging service
   */
  private async sendToExternalService(metadata: LLMUsageMetadata): Promise<void> {
    try {
      // TODO: Implement integration with monitoring service
      // Example: Send to Supabase analytics table, DataDog, or custom logging endpoint
      
      // For now, we can store in a simple format
      const logEntry = {
        timestamp: metadata.timestamp,
        provider: metadata.provider,
        model: metadata.model,
        tokens: {
          input: metadata.prompt_tokens,
          output: metadata.completion_tokens,
          total: metadata.total_tokens,
          cached: metadata.cached_tokens || 0,
        },
        cost_usd: metadata.cost_usd,
        latency_ms: metadata.latency_ms,
        user_id: metadata.user_id,
        request_id: metadata.request_id,
      };

      // Uncomment to enable external logging
      // await this.sendToAnalyticsService(logEntry);
      
    } catch (error) {
      console.error('❌ Failed to send metadata to external service:', error);
    }
  }

  /**
   * Helper to track request start time
   */
  public createLatencyTracker(): { getLatency: () => number } {
    const startTime = Date.now();
    return {
      getLatency: () => Date.now() - startTime
    };
  }
} 