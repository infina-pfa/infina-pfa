import { ChatToolId } from "@/lib/types/ai-streaming.types";
import { ChatTool, Tool, UIActionType } from "../types/index";

export const chatTools: ChatTool[] = [
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

export const mcpToolsList = [
  {
    id: "personal-finance-management",
    name: "Quản lý tài chính cá nhân",
    description:
      "Có thể giúp user tạo/quản lý/cập nhật/xoá: {ngân sách, chi tiêu, thu nhập}, và phân tích tình hình tài chính cá nhân cũng như các tài khoản tài chính khác",
    keywords: [],
  },
];

export const functionTools: Tool[] = [
  {
    type: "function",
    strict: false,
    name: UIActionType.OPEN_TOOL,
    description:
      "Open a specific financial tool for the user when they need practical assistance",
    parameters: {
      type: "object",
      properties: {
        tool_id: {
          type: "string",
          description: "ID of the tool to open",
          enum: [
            "budget-tool",
            "loan-calculator",
            "interest-calculator",
            "salary-calculator",
            "learning-center",
          ],
        },
        title: {
          type: "string",
          description: "Title or reason for opening the tool",
        },
        context: {
          type: "object",
          description: "Additional context or parameters for the tool",
        },
        trigger_reason: {
          type: "string",
          description: "Explanation for why this tool should be opened",
        },
      },
      required: ["tool_id", "title", "trigger_reason"],
    },
  },
  {
    type: "function",
    strict: false,
    name: UIActionType.SHOW_COMPONENT,
    description:
      "Show a specific component to the user instead of long information",
    parameters: {
      type: "object",
      properties: {
        component_id: {
          type: "string",
          description: "ID of the component to show",
          enum: ["budget-overview", "budget-detail"],
        },
        title: {
          type: "string",
          description: "Title of the component",
        },
      },
      required: ["component_id", "title"],
    },
  },
];

export function getToolsInfo(): string {
  return chatTools
    .map(
      (tool) =>
        `Tool ID: "${tool.id}" | Tên: "${tool.name}" | Mô tả: "${
          tool.description
        }" | Từ khóa: [${tool.keywords.join(", ")}]`
    )
    .join("\n");
}

export function getMcpToolsInfo(): string {
  return mcpToolsList
    .map(
      (tool) =>
        `Tool ID: "${tool.id}" | Tên: "${tool.name}" | Mô tả: "${
          tool.description
        }" | Từ khóa: [${tool.keywords.join(", ")}]`
    )
    .join("\n");
}
