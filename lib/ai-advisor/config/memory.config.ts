import { MemoryConfig } from '../types/memory';

// Memory processing constants
export const MEMORY_CONSTANTS = {
  EMBEDDING_MODEL: 'text-embedding-3-small',
  EXTRACTION_MODEL: 'gpt-4.1-mini-2025-04-14',
  MAX_CONVERSATION_MESSAGES: 5,
  EMBEDDING_DIMENSIONS: 1536,
  SIMILARITY_THRESHOLD: 0.8,
  MAX_EXTRACTION_TOKENS: 1000,
  BACKGROUND_PERSIST_ENABLED: true,
  MAX_MEMORIES_PER_USER: 50,
  MIN_WORDS_FOR_MEMORY: 3,
  QUEUE_PROCESSING_DELAY: 100
} as const;

export class MemoryConfigFactory {
  static createFromEnv(): MemoryConfig {
    console.log("🔧 MemoryConfigFactory.createFromEnv() called");
    
    // Log all relevant environment variables (safely)
    console.log("🌍 Environment variables check:", {
      NODE_ENV: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      openAIKeyLength: process.env.OPENAI_API_KEY?.length || 0,
    });
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    console.log("🔍 Raw environment values:", {
      supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 50)}...` : 'UNDEFINED/EMPTY',
      supabaseKey: supabaseKey ? `${supabaseKey.substring(0, 30)}...` : 'UNDEFINED/EMPTY',
      openaiKey: openaiKey ? `${openaiKey.substring(0, 20)}...` : 'UNDEFINED/EMPTY'
    });

    // Validate required environment variables
    if (!supabaseUrl) {
      const error = 'NEXT_PUBLIC_SUPABASE_URL is required in environment variables';
      console.error("❌ Memory config error:", error);
      throw new Error(error);
    }
    
    if (!supabaseKey) {
      const error = 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required in environment variables';
      console.error("❌ Memory config error:", error);
      throw new Error(error);
    }
    
    if (!openaiKey) {
      const error = 'OPENAI_API_KEY is required in environment variables';
      console.error("❌ Memory config error:", error);
      throw new Error(error);
    }

    console.log('📊 Memory Config Debug:', {
      supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET',
      supabaseKey: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET',
      openaiKey: openaiKey ? `${openaiKey.substring(0, 20)}...` : 'NOT SET'
    });

    const config: MemoryConfig = {
      supabaseUrl,
      supabaseKey,
      openaiKey,
      similarityThreshold: MEMORY_CONSTANTS.SIMILARITY_THRESHOLD,
      maxMemories: MEMORY_CONSTANTS.MAX_MEMORIES_PER_USER,
      cacheEnabled: true,
      backgroundPersist: MEMORY_CONSTANTS.BACKGROUND_PERSIST_ENABLED,
    };
    
    console.log("✅ Memory config created successfully:", {
      similarityThreshold: config.similarityThreshold,
      maxMemories: config.maxMemories,
      cacheEnabled: config.cacheEnabled,
      backgroundPersist: config.backgroundPersist
    });

    return config;
  }

  static create(overrides: Partial<MemoryConfig> = {}): MemoryConfig {
    console.log("🔧 MemoryConfigFactory.create() called with overrides:", {
      overrideKeys: Object.keys(overrides),
      hasOverrides: Object.keys(overrides).length > 0
    });
    
    const defaultConfig = this.createFromEnv();
    const finalConfig = { ...defaultConfig, ...overrides };
    
    console.log("✅ Final memory config:", {
      configKeys: Object.keys(finalConfig),
      hasSupabaseUrl: !!finalConfig.supabaseUrl,
      hasSupabaseKey: !!finalConfig.supabaseKey,
      hasOpenaiKey: !!finalConfig.openaiKey
    });
    
    return finalConfig;
  }
} 