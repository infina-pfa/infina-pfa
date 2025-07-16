import OpenAi from "openai";

export interface ChatTool {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

export interface ChatComponent {
  id: string;
  name: string;
  description: string;
}

export interface ConversationMessage {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
}

export interface MCPTool {
  type: "mcp";
  server_label: string;
  server_url: string;
  require_approval: "never" | "always";
  allowed_tools?: string[];
  headers?: Record<string, string>;
}

export interface MCPToolItem {
  name: string;
  description: string;
}

export type Tool = OpenAi.Responses.Tool;

// Gemini-specific interfaces
export interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface GeminiTool {
  function_declarations: GeminiFunctionDeclaration[];
}

export interface GeminiStreamChunk {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        functionCall?: {
          name: string;
          args: Record<string, unknown>;
        };
      }>;
    };
    finishReason?: string;
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

export interface ResponseEvent {
  type: string;
  delta?: string;
  name?: string;
  arguments?: string;
}

export interface MCPConfig {
  enabled: boolean;
  serverUrl: string;
  serverLabel: string;
  timeout: number;
  retryAttempts: number;
  requireApproval: "never" | "always";
  allowedTools?: string[];
  description: string;
  bearerToken?: string;
}

export interface MCPError {
  message?: string;
  code?: string;
  name?: string;
  stack?: string;
}

export interface UserContext {
  financial?: {
    totalIncome?: number;
    totalExpenses?: number;
    totalCurrentMonthIncome?: number;
    totalCurrentMonthExpenses?: number;
    currentBudgets?: number;
    budgetCategories?: string[];
    budgets?: Array<{
      id: string;
      name: string;
      budgeted: number;
      spent: number;
    }>;
  };
}

export interface RequestBody {
  message: string;
  conversationHistory: ConversationMessage[];
  userContext: UserContext;
  conversationId: string;
  user_id: string;
  provider?: "openai" | "gemini"; // Optional provider selection
}

export interface MemorySearchOptions {
  waitForResults: boolean;
  useCache: boolean;
  similarityThreshold: number;
}

export interface FunctionCall {
  name: string;
  arguments: string;
  call_id: string;
  complete: boolean;
}

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

export enum UIActionType {
  OPEN_TOOL = "open_tool",
  SHOW_COMPONENT = "show_component",
  SHOW_SUGGESTION = "show_suggestion",
  SHOW_VIDEO = "show_video",
}
