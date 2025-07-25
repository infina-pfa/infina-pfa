// Response data event types
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
}

export enum ChatToolId {
  BUDGET_TOOL = "budget-tool",
  LOAN_CALCULATOR = "loan-calculator",
  INTEREST_CALCULATOR = "interest-calculator",
  SALARY_CALCULATOR = "salary-calculator",
}

export enum ChatComponentId {
  BUDGET_OVERVIEW = "budget-overview",
  BUDGET_DETAIL = "budget-detail",
  VIDEO = "video",
  SUGGESTIONS = "suggestions",
  GOAL_DASHBOARD = "goal-dashboard",
  // PAY_YOURSELF_FIRST_CONFIRMATION = "pay-yourself-first-confirmation",
  BUDGETING_DASHBOARD = "budgeting-dashboard",
  MONTHLY_BUDGET_ANALYSIS = "monthly-budget-analysis",
  // SURPLUS_ALLOCATION = "surplus-allocation",
}

export enum MCPId {
  GENERAL = "general",
}

export interface ChatTool {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

export interface ConversationMessage {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
}
