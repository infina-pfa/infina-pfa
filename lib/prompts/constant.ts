import { ChatComponent, MCPTool } from "@/lib/ai-advisor/types";
import {
  ChatComponentId,
  ChatTool,
  ChatToolId,
  MCPId,
} from "@/lib/types/ai-streaming.types";

export const CHAT_TOOLS: ChatTool[] = [
  {
    id: ChatToolId.BUDGET_TOOL,
    name: "Công cụ Ngân sách",
    description: "Giúp người dùng tạo và quản lý ngân sách cá nhân",
    keywords: ["ngân sách", "budget", "chi tiêu", "tiết kiệm", "quản lý tiền"],
  },
  {
    id: ChatToolId.LOAN_CALCULATOR,
    name: "Công cụ tính lãi vay",
    description: "Tính toán lãi suất và lịch trả nợ cho các khoản vay",
    keywords: ["tính vay", "vay tiền", "lãi vay", "loan", "tín dụng", "trả nợ"],
  },
  {
    id: ChatToolId.INTEREST_CALCULATOR,
    name: "Công cụ tính lãi tiết kiệm",
    description: "Tính toán lãi suất tiền gửi tiết kiệm",
    keywords: ["tính lãi", "lãi suất", "tiết kiệm", "interest", "tiền gửi"],
  },
  {
    id: ChatToolId.SALARY_CALCULATOR,
    name: "Công cụ tính lương",
    description: "Tính lương gross sang net và các khoản khấu trừ",
    keywords: [
      "tính lương",
      "lương net",
      "lương gross",
      "salary",
      "thuế thu nhập",
    ],
  },
];

export const COMPONENT_TOOLS: ChatComponent[] = [
  {
    id: ChatComponentId.BUDGET_OVERVIEW,
    name: "Budget Overview",
    description: "Show a overview of the user's budget",
  },
  {
    id: ChatComponentId.BUDGET_DETAIL,
    name: "Budget Detail",
    description: "Show a detail of the user's budget",
  },
  {
    id: ChatComponentId.VIDEO,
    name: "Video",
    description: "Show a video to the user",
  },
  {
    id: ChatComponentId.SUGGESTIONS,
    name: "Suggestions",
    description: "Show suggestions to the user",
  },
  {
    id: ChatComponentId.GOAL_DASHBOARD,
    name: "Goal Dashboard",
    description: "Show emergency fund progress and goal tracking dashboard",
  },

  {
    id: ChatComponentId.BUDGETING_DASHBOARD,
    name: "Budgeting Dashboard",
    description:
      "Overview of current month's budget performance with category-wise spending and quick actions",
  },
  {
    id: ChatComponentId.MONTHLY_BUDGET_ANALYSIS,
    name: "Monthly Budget Analysis",
    description:
      "End-of-month analysis of budget performance, overspent categories, and spending comparison",
  },

];

export const MCP_TOOLS: { [key: string]: MCPTool } = {
  [MCPId.GENERAL]: {
    type: "mcp",
    server_label: "personal-finance-management-tools",
    server_url: process.env.MCP_SERVER_URL!,
    require_approval: "never",
    allowed_tools: undefined,
    headers: {
      Authorization: `Bearer ${process.env.MCP_BEARER_TOKEN!}`,
    },
  },
};
