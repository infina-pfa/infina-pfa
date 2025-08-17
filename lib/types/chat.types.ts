import {
  Enums,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/supabase/database";
import { ChatToolId } from "./ai-streaming.types";
import { StreamEvent } from "./streaming.types";

// Database types
export type Conversation = Tables<"conversations">;
export type ConversationInsert = TablesInsert<"conversations">;
export type ConversationUpdate = TablesUpdate<"conversations">;

export type Message = Tables<"messages">;
export type MessageInsert = TablesInsert<"messages">;
export type MessageUpdate = TablesUpdate<"messages">;

// Enum types
export type MessageSender = Enums<"message_sender">;
export type MessageType = Enums<"message_type">;

// Image upload response
export interface UploadImageResponse {
  fileName: string;
  filePath: string;
  publicUrl: string;
  size: number;
  mimeType: string;
}

// Extended message types for the chat interface
export interface ChatMessage extends Message {
  isStreaming?: boolean;
  streamingContent?: string;
}

// Component data for interactive UI components
export interface ComponentData {
  type: ChatToolId;
  props: Record<string, unknown>;
  title?: string;
  description?: string;
}

export interface ComponentState {
  isOpen: boolean;
  currentComponent?: ComponentData;
  history: ComponentData[];
}

// API Request/Response types
export interface CreateConversationRequest {
  name: string;
}

export interface CreateConversationResponse {
  status: number;
  data?: Conversation;
  error?: string;
  message?: string;
}

export interface SendMessageRequest {
  content: string;
  conversationId: string;
  type?: MessageType;
  metadata?: Record<string, unknown>;
}

export interface SendMessageResponse {
  success: boolean;
  data?: {
    userMessage: Message;
    conversationId: string;
  };
  error?: string;
  message?: string;
}

// Legacy streaming types - replaced by AI Advisor streaming
// Keeping for compatibility but these are deprecated

// Chat suggestions
export interface ChatSuggestion {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

// Default chat suggestions
export const DEFAULT_CHAT_SUGGESTIONS: ChatSuggestion[] = [
  {
    id: "create_budget",
    label: "Giúp tôi tạo ngân sách",
    description: "Thiết lập kế hoạch ngân sách hàng tháng",
    icon: "calculator",
  },
  {
    id: "analyze_spending",
    label: "Phân tích thói quen chi tiêu của tôi",
    description: "Xem xét các giao dịch gần đây",
    icon: "trending-down",
  },
  {
    id: "plan_goals",
    label: "Lập kế hoạch mục tiêu tài chính",
    description: "Đặt và theo dõi các mục tiêu tài chính",
    icon: "target",
  },
  {
    id: "review_investments",
    label: "Xem xét các khoản đầu tư",
    description: "Phân tích danh mục và đưa ra khuyến nghị",
    icon: "trending-up",
  },
];

// Chat context for AI
export interface ChatContext {
  userId: string;
  userName: string;
  userProfile?: {
    totalAssetValue: number;
    recentTransactions?: Array<{
      id: string;
      amount: number;
      name: string;
      type: string;
      created_at: string;
    }>;
    budgets?: Array<{
      id: string;
      name: string;
      month: number;
      year: number;
    }>;
    goals?: Array<{
      id: string;
      title: string;
      current_amount: number;
      target_amount: number | null;
    }>;
  };
  conversationHistory: Message[];
  currentComponent?: ComponentData;
}

// Error types
export interface ChatError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Legacy UseStreamingChatReturn interface - replaced by AI Advisor streaming
// This interface is deprecated

// WebSocket message types
export interface WebSocketMessage {
  type:
    | "user_message"
    | "ai_response_start"
    | "ai_response_chunk"
    | "ai_response_complete"
    | "component_render"
    | "error";
  payload: {
    conversationId: string;
    messageId?: string;
    content?: string;
    component?: ComponentData;
    error?: ChatError;
    timestamp: string;
  };
}

// Service response types
export interface ChatServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ChatError;
}

export type CreateSessionResponse = ChatServiceResponse<{
  conversation: Conversation;
  welcomeMessage: Message;
}>;

export type SendMessageServiceResponse = ChatServiceResponse<{
  userMessage: Message;
  streamUrl: string;
}>;

// UI Action Types for AI Advisor
export enum UIActionType {
  OPEN_TOOL = "open_tool",
  SHOW_COMPONENT = "show_component",
}

export type UITool =
  | "budget-tool"
  | "loan-calculator"
  | "interest-calculator"
  | "salary-calculator"
  | "learning-center";

export interface UIAction {
  type: UIActionType;
  payload: {
    toolId?: UITool;
    componentId?: string;
    title?: string;
    context?: Record<string, unknown>;
  };
}

// AI Advisor Request/Response Types
export interface AdvisorStreamRequest {
  conversationId: string;
  message: string;
  sender: MessageSender;
  imageUrls?: string[];
}

// Response Data Event Types (matching the backend)
export enum ResponseDataEvent {
  RESPONSE_CREATED = "response_created",
  OUTPUT_TEXT_STREAMING = "response_output_text_streaming",
  OUTPUT_TEXT_DONE = "response_output_text_done",
  FUNCTION_CALL_ARGUMENTS_STREAMING = "response_function_call_arguments_streaming",
  FUNCTION_CALL_ARGUMENTS_DONE = "response_function_call_arguments_done",
  MCP_TOOL_CALLING = "mcp_tool_calling",
  MCP_TOOL_CALL_DONE = "mcp_tool_call_done",
  MCP_TOOL_CALL_FAILED = "mcp_tool_call_failed",
  RESPONSE_COMPLETED = "response_completed",
}

export interface AdvisorStreamEvent {
  type: ResponseDataEvent | "error";
  content?: string;
  action?: UIAction;
  response_id?: string;
  error?: string;
  finish_reason?: string;
  timestamp: string;
}

// Hook Types for AI Advisor Stream Processor
export interface UseAIAdvisorStreamProcessorOptions {
  userId: string;
  onMessageComplete?: (message: ChatMessage) => void;
  onFunctionToolComplete?: (action: UIAction) => void;
  onMessageStreaming?: (message: ChatMessage) => void;
  onMessageUpdate?: (messageId: string, message: ChatMessage) => void;
}

export interface UseAIAdvisorStreamProcessorReturn {
  isProcessing: boolean;
  isStreaming: boolean;
  isMCPLoading: boolean;
  mcpLoadingMessage: string;
  processStreamData: (
    conversationId: string,
    readableStream: ReadableStream<Uint8Array>
  ) => Promise<void>;
  processStreamEvent: (event: StreamEvent) => void;
  reset: () => void;
  responseId: string;
}
