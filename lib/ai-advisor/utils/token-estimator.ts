/**
 * Utility for estimating token counts for different models
 */
export class TokenEstimator {
  /**
   * Rough estimation: 1 token ≈ 4 characters for English, 6 characters for Vietnamese
   */
  static estimateTokensBasic(text: string): number {
    // Average for Vietnamese text (more characters per token)
    return Math.ceil(text.length / 5);
  }

  /**
   * More advanced estimation considering punctuation and whitespace
   */
  static estimateTokensAdvanced(text: string): number {
    // Split by words and punctuation
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const punctuation = (text.match(/[.,!?;:()]/g) || []).length;
    
    // Rough estimation: words + punctuation + some overhead
    return Math.ceil(words.length * 1.3 + punctuation * 0.5);
  }

  /**
   * Estimate tokens for message array format
   */
  static estimateInputTokensFromMessages(
    messages: { role: string; content: string }[]
  ): number {
    let totalTokens = 0;
    
    for (const message of messages) {
      // Base tokens for role and structure
      totalTokens += 4; // role overhead
      totalTokens += this.estimateTokensAdvanced(message.content);
    }
    
    // Add overhead for message formatting
    totalTokens += messages.length * 2;
    
    return totalTokens;
  }

  /**
   * Estimate tokens for function tools
   */
  static estimateToolTokens(tools: unknown[]): number {
    const toolsJson = JSON.stringify(tools);
    return this.estimateTokensAdvanced(toolsJson);
  }
} 