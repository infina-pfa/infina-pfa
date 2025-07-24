import { Memory } from '../types/memory';

/**
 * Format memories for context display
 */
export function formatMemoriesForContext(memories: Memory[]): string {
  if (memories.length === 0) {
    return '';
  }

  const formattedMemories = memories
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((memory, index) => `${index + 1}. ${memory.content} (Created: ${memory.created_at})`)
    .join('\n');

  return `=== User Personal Information & Context (Sorted by created_at from latest to oldest) ===
${formattedMemories}
=== End of User Personal Information ===`;
}

/**
 * Check if content should trigger memory extraction
 */
export function shouldExtractMemory(content: string): boolean {
  const memoryTriggers = [
    // Personal information
    'tôi là', 'tên tôi', 'tuổi', 'năm sinh', 'sinh năm',
    // Financial context
    'lương', 'thu nhập', 'tiết kiệm', 'đầu tư', 'mục tiêu tài chính',
    // Family context
    'gia đình', 'vợ', 'chồng', 'con', 'bố mẹ', 'anh chị em',
    // Work context
    'công việc', 'nghề nghiệp', 'công ty', 'làm việc'
  ];

  const lowerContent = content.toLowerCase();
  return memoryTriggers.some(trigger => lowerContent.includes(trigger));
}

/**
 * Clean and normalize memory content
 */
export function normalizeMemoryContent(content: string): string {
  return content
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[""]/g, '"') // Normalize quotes
    .substring(0, 500); // Limit length
} 