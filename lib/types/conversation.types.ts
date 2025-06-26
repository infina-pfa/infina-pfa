import { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database";

// Database types
export type Conversation = Tables<"user_conversations">;
export type ConversationInsert = TablesInsert<"user_conversations">;
export type ConversationUpdate = TablesUpdate<"user_conversations">;

// API Request types
export interface CreateConversationRequest {
  title: string;
  latest_response_id?: string | null;
}

export interface UpdateConversationRequest {
  title?: string;
  latest_response_id?: string | null;
  deleted_at?: string | null;
}

export interface GetConversationsQuery {
  include_deleted?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}

// API Response types
export interface ConversationResponse {
  success: boolean;
  data?: Conversation;
  error?: string;
  message?: string;
}

export interface ConversationsListResponse {
  success: boolean;
  data?: Conversation[];
  error?: string;
  message?: string;
  total?: number;
}

// Conversation validation schema
export const CONVERSATION_VALIDATION = {
  title: {
    minLength: 1,
    maxLength: 255,
  },
} as const;

// Utility types for conversation management
export interface ConversationSummary {
  total: number;
  active: number;
  deleted: number;
  recent_count?: number;
}

// Extended conversation with message count
export interface ConversationWithStats extends Conversation {
  message_count?: number;
  last_message_at?: string;
} 