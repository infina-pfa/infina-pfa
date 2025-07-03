/**
 * Token estimation utilities for LLM providers
 * Used when real-time token usage is not available (e.g., Gemini streaming)
 */

/**
 * Rough token estimation based on text length
 * This is an approximation - actual tokenization varies by model
 * 
 * General rule: ~4 characters per token for English text
 * More complex for other languages and special tokens
 */
export class TokenEstimator {
  
  /**
   * Estimate token count from text
   * Based on OpenAI's rule of thumb: ~4 characters per token
   */
  static estimateTokensFromText(text: string): number {
    if (!text) return 0;
    
    // Basic estimation: 4 characters per token
    // Account for spaces, punctuation, and word boundaries
    const baseTokens = Math.ceil(text.length / 4);
    
    // Adjust for special patterns
    const words = text.split(/\s+/).length;
    const specialChars = (text.match(/[^\w\s]/g) || []).length;
    
    // More accurate estimation considering word boundaries
    return Math.max(baseTokens, Math.ceil(words * 1.3 + specialChars * 0.5));
  }

  /**
   * Estimate tokens for messages array (conversation history + current message)
   */
  static estimateInputTokensFromMessages(
    messages: Array<{ role: string; content: string }>
  ): number {
    let totalTokens = 0;
    
    for (const message of messages) {
      // Base tokens for content
      totalTokens += this.estimateTokensFromText(message.content);
      
      // Add overhead for message structure
      // OpenAI adds ~4 tokens per message for role, formatting, etc.
      totalTokens += 4;
      
      // Add tokens for role
      totalTokens += this.estimateTokensFromText(message.role);
    }
    
    // Add overhead for conversation formatting
    totalTokens += 2;
    
    return totalTokens;
  }

  /**
   * More sophisticated estimation using word count and character patterns
   */
  static estimateTokensAdvanced(text: string): number {
    if (!text) return 0;
    
    // Split into words and analyze patterns
    const words = text.trim().split(/\s+/);
    let tokenCount = 0;
    
    for (const word of words) {
      if (word.length === 0) continue;
      
      // Simple words: 1 token
      if (word.length <= 4 && /^[a-zA-Z]+$/.test(word)) {
        tokenCount += 1;
      }
      // Medium words: may be 1-2 tokens
      else if (word.length <= 8) {
        tokenCount += Math.ceil(word.length / 4);
      }
      // Long words or complex patterns: more tokens
      else {
        tokenCount += Math.ceil(word.length / 3.5);
      }
      
      // Account for punctuation attached to words
      const punctuation = word.match(/[^\w]/g);
      if (punctuation) {
        tokenCount += punctuation.length * 0.5;
      }
    }
    
    return Math.ceil(tokenCount);
  }

  /**
   * Estimate cost based on estimated tokens
   */
  static estimateCost(
    inputTokens: number,
    outputTokens: number,
    provider: 'openai' | 'gemini',
    model: string
  ): number {
    // Pricing per 1M tokens (USD)
    const pricing: Record<string, Record<string, { input: number; output: number }>> = {
      openai: {
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
      },
      gemini: {
        'gemini-2.0-flash-exp': { input: 0.075, output: 0.30 },
        'gemini-2.5-flash': { input: 0.3, output: 2.50 },
        'gemini-1.5-flash': { input: 0.075, output: 0.30 },
        'gemini-1.5-pro': { input: 1.25, output: 5.00 },
      }
    };

    const modelPricing = pricing[provider]?.[model] || pricing[provider]?.[Object.keys(pricing[provider])[0]];
    
    if (!modelPricing) return 0;

    const inputCost = (inputTokens / 1_000_000) * modelPricing.input;
    const outputCost = (outputTokens / 1_000_000) * modelPricing.output;

    return inputCost + outputCost;
  }

  /**
   * Get token estimation summary for debugging
   */
  static getEstimationSummary(
    inputText: string,
    outputText: string,
    provider: 'openai' | 'gemini',
    model: string
  ): {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCost: number;
    method: string;
  } {
    const inputTokens = this.estimateTokensAdvanced(inputText);
    const outputTokens = this.estimateTokensAdvanced(outputText);
    const totalTokens = inputTokens + outputTokens;
    const estimatedCost = this.estimateCost(inputTokens, outputTokens, provider, model);

    return {
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCost,
      method: 'advanced_estimation'
    };
  }
} 