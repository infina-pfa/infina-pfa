// Memory-related types and interfaces
export interface Memory {
  id: string;
  user_id: string;
  agent_id?: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  relevance_score?: number;
}

export interface MemoryConfig {
  supabaseUrl: string;
  supabaseKey: string;
  openaiKey: string;
  backgroundPersist: boolean;
}

export interface QueueOperation {
  operation: 'add' | 'update' | 'delete';
  data: Memory;
  timestamp: number;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface MemoryFact {
  fact: string;
  category: string;
}

export interface MemoryExtractionResponse {
  should_save: boolean;
  facts: MemoryFact[];
}

export type MemoryCategory = 
  | 'PERSONAL_DEMOGRAPHIC'
  | 'FINANCIAL_GOALS'
  | 'FINANCIAL_ATTITUDE'
  | 'FINANCIAL_CIRCUMSTANCES'
  | 'LIFESTYLE_PREFERENCES'
  | 'FAMILY_CONTEXT'; 