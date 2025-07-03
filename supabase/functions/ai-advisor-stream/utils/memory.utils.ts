import { Memory } from '../types/memory.ts';

/**
 * Memory utility functions
 */
export class MemoryUtils {
  /**
   * Format memories into context string for AI prompts
   */
  static formatMemoriesAsContext(memories: Memory[]): string {
    if (memories.length === 0) return '';
    
    return `--- Start of relevant information from your memory ---
${memories
      .map((m, i) => `${i + 1}. ${m.content}`)
      .join('\n')}
--- End of memory information ---`;
  }

  /**
   * Format user memories as personal context
   */
  static formatUserMemories(
    memories: Array<{ content: string; created_at: string }>
  ): string {
    if (memories.length === 0) return '';
    
    return `=== User Personal Information & Context (Latest to Oldest) ===
${memories
      .map((item, index) => 
        `${index + 1}. ${item.content} (Created: ${new Date(item.created_at).toLocaleDateString()})`
      )
      .join('\n')}
=== End of User Personal Information ===`;
  }

  /**
   * Filter memories by category
   */
  static filterByCategory(memories: Memory[], category: string): Memory[] {
    return memories.filter(m => 
      m.metadata?.category === category
    );
  }

  /**
   * Get recent memories within specified days
   */
  static getRecentMemories(memories: Memory[], days: number = 30): Memory[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return memories.filter(m => 
      new Date(m.created_at) >= cutoffDate
    );
  }

  /**
   * Sanitize sensitive information from memory content
   */
  static sanitizeContent(content: string): string {
    return content
      .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '****-****-****-****') // Credit cards
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***-**-****') // SSN-like patterns
      .replace(/\b\d{3}\.\d{2}\.\d{4}\b/g, '***.**.****') // Tax ID patterns
      .replace(/\$[\d,]+\.\d{2}/g, '$***.**'); // Exact dollar amounts
  }
} 