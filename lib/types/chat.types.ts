import { Tables, TablesInsert, TablesUpdate, Enums } from "@/lib/supabase/database";

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

// Extended message types for the chat interface
export interface ChatMessage extends Message {
  isStreaming?: boolean;
  streamingContent?: string;
  component?: ComponentData | null;
}

// Component data for interactive UI components
export interface ComponentData {
  type: 'budget_form' | 'expense_tracker' | 'goal_planner' | 'investment_calculator' | 'spending_chart';
  props: Record<string, unknown>;
  title?: string;
  description?: string;
}

// Chat session management
export interface ChatSession {
  conversationId: string;
  messages: ChatMessage[];
  isAiTyping: boolean;
  currentStreamingMessageId?: string;
  componentState?: ComponentState;
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
  success: boolean;
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
  text: string;
  description?: string;
  icon?: string;
}

// Default chat suggestions
export const DEFAULT_CHAT_SUGGESTIONS: ChatSuggestion[] = [
  {
    id: 'create_budget',
    text: 'Help me create a budget',
    description: 'Set up a monthly budget plan',
    icon: 'calculator'
  },
  {
    id: 'analyze_spending',
    text: 'Analyze my spending patterns',
    description: 'Review your recent transactions',
    icon: 'trending-down'
  },
  {
    id: 'plan_goals',
    text: 'Plan my financial goals',
    description: 'Set and track financial objectives',
    icon: 'target'
  },
  {
    id: 'review_investments',
    text: 'Review my investments',
    description: 'Portfolio analysis and recommendations',
    icon: 'trending-up'
  }
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

// Chat state management
export interface ChatState {
  // Session
  session: ChatSession | null;
  
  // UI State
  isLoading: boolean;
  error: ChatError | null;
  showSuggestions: boolean;
  
  // Component state
  componentPanel: {
    isOpen: boolean;
    currentComponent?: ComponentData;
    isMobile: boolean;
  };
  
  // Input state
  inputValue: string;
  isSubmitting: boolean;
}

// Hook return types
export interface UseChatReturn {
  // State
  session: ChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: ChatError | null;
  isAiTyping: boolean;
  showSuggestions: boolean;
  
  // Actions
  sendMessage: (content: string) => Promise<void>;
  createNewSession: () => Promise<void>;
  clearError: () => void;
  
  // Component actions
  openComponent: (component: ComponentData) => void;
  closeComponent: () => void;
  
  // Input handling
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSubmit: () => Promise<void>;
  isSubmitting: boolean;
  
  // Suggestion handling
  suggestions: ChatSuggestion[];
  onSuggestionClick: (suggestion: string) => Promise<void>;
}

// Legacy UseStreamingChatReturn interface - replaced by AI Advisor streaming
// This interface is deprecated

// WebSocket message types
export interface WebSocketMessage {
  type: 'user_message' | 'ai_response_start' | 'ai_response_chunk' | 'ai_response_complete' | 'component_render' | 'error';
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

// API endpoints
export const CHAT_API_ENDPOINTS = {
  CONVERSATIONS: '/api/conversations',
  MESSAGES: '/api/messages',
  ADVISOR_STREAM: '/api/chat/advisor-stream',
  USER_PROFILE: '/api/users/profile',
} as const;

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
  message: string;
  conversationHistory: Array<{
    id: string;
    content: string;
    sender: "user" | "ai";
    timestamp: string;
  }>;
  userContext?: {
    financial?: {
      totalIncome?: number;
      totalExpenses?: number;
      totalCurrentMonthIncome?: number;
      totalCurrentMonthExpenses?: number;
      currentBudgets?: number;
      budgetCategories?: string[];
      budgets?: Array<{
        name: string;
        budgeted: number;
        spent: number;
      }>;
      hasCompletedOnboarding?: boolean;
    };
    learning?: {
      currentLevel?: number;
      xp?: number;
      currentGoal?: string;
      progress?: string;
    };
  };
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
  conversationId: string;
  userId: string;
  onMessageComplete?: (message: ChatMessage) => void;
  onFunctionToolComplete?: (action: UIAction) => void;
  onMessageStreaming?: (message: ChatMessage) => void;
  onMessageUpdate?: (messageId: string, message: ChatMessage) => void;
}

export interface UseAIAdvisorStreamProcessorReturn {
  isProcessing: boolean;
  isStreaming: boolean;
  processStreamData: (readableStream: ReadableStream<Uint8Array>) => Promise<void>;
  processStreamEvent: (event: AdvisorStreamEvent) => void;
  reset: () => void;
  responseId: string;
} 