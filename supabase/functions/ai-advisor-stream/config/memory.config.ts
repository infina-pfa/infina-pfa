import { MemoryConfig } from '../types/memory.ts';

/**
 * Memory configuration factory
 */
export class MemoryConfigFactory {
  static create(overrides: Partial<MemoryConfig> = {}): MemoryConfig {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    if (!supabaseUrl || !supabaseKey || !openaiKey) {
      throw new Error('Missing required environment variables for memory configuration');
    }

    return {
      supabaseUrl,
      supabaseKey,
      openaiKey,
      backgroundPersist: true,
      ...overrides,
    };
  }
}

export const MEMORY_CONSTANTS = {
  EMBEDDING_MODEL: 'text-embedding-3-small',
  EXTRACTION_MODEL: 'gpt-4.1-mini-2025-04-14',
  MAX_FACTS_PER_EXTRACTION: 15,
  MIN_WORDS_FOR_MEMORY: 3,
  QUEUE_PROCESSING_DELAY: 100,
} as const; 