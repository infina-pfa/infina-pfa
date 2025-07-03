export interface Memory {
  id: string;
  user_id: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MemoryConfig {
  supabaseUrl: string;
  supabaseKey: string;
  openaiKey: string;
  similarityThreshold: number;
  maxMemories: number;
  cacheEnabled: boolean;
  backgroundPersist: boolean;
}

export interface QueueOperation {
  operation: 'add' | 'update' | 'delete';
  data: Memory;
  timestamp: number;
}

export interface ConversationMessage {
  role: string;
  content: string;
}

export interface MemoryExtractionResponse {
  should_save: boolean;
  facts: Array<string | MemoryFact>;
}

export interface MemoryFact {
  fact: string;
  category: MemoryCategory;
}

export enum MemoryCategory {
  PERSONAL_DEMOGRAPHIC = 'PERSONAL_DEMOGRAPHIC',
  FINANCIAL_GOALS = 'FINANCIAL_GOALS', 
  FINANCIAL_ATTITUDE = 'FINANCIAL_ATTITUDE',
  FINANCIAL_CIRCUMSTANCES = 'FINANCIAL_CIRCUMSTANCES',
  LIFESTYLE_PREFERENCES = 'LIFESTYLE_PREFERENCES',
  FAMILY_CONTEXT = 'FAMILY_CONTEXT'
} 