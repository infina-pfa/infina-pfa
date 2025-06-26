import { Tables, TablesInsert, TablesUpdate, Enums } from "@/lib/supabase/database";

// Database types
export type Message = Tables<"user_messages">;
export type MessageInsert = TablesInsert<"user_messages">;
export type MessageUpdate = TablesUpdate<"user_messages">;
export type MessageSenderType = Enums<"message_sender_type">;

// API Request types
export interface CreateMessageRequest {
  content: string;
  conversation_id: string;
  sender_type: MessageSenderType;
  meta_data?: Record<string, unknown> | null;
}

export interface UpdateMessageRequest {
  content?: string;
  meta_data?: Record<string, unknown> | null;
}

export interface GetMessagesQuery {
  conversation_id?: string;
  sender_type?: MessageSenderType;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

// API Response types
export interface MessageResponse {
  success: boolean;
  data?: Message;
  error?: string;
  message?: string;
}

export interface MessagesListResponse {
  success: boolean;
  data?: Message[];
  error?: string;
  message?: string;
  total?: number;
}

// Message validation schema
export const MESSAGE_VALIDATION = {
  content: {
    minLength: 1,
    maxLength: 10000,
  },
} as const;

// Message sender types
export const MESSAGE_SENDER_TYPES: MessageSenderType[] = ["BOT", "USER"];

// Utility types for message analytics
export interface MessageSummary {
  total: number;
  user_messages: number;
  bot_messages: number;
  by_conversation?: Record<string, number>;
  by_date?: Record<string, number>;
}

// Extended message with conversation info
export interface MessageWithConversation extends Message {
  conversation_title?: string;
} 