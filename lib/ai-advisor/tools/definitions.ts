import { ChatComponentId, ChatToolId } from "@/lib/types/ai-streaming.types";
import { ChatComponent, ChatTool, Tool, UIActionType } from "../types/index";

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

export const componentTools: ChatComponent[] = [
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
    description: "Overview of current month's budget performance with category-wise spending and quick actions",
  },
  {
    id: ChatComponentId.MONTHLY_BUDGET_ANALYSIS,
    name: "Monthly Budget Analysis",
    description: "End-of-month analysis of budget performance, overspent categories, and spending comparison",
  },

];

export const mcpToolsList = [
  {
    id: "budget-management",
    name: "Budget Management",
    description:
      "Can help user create/manage/update/delete: {budget, spending, income}, and analyze the financial situation of the user as well as other financial accounts",
    keywords: ["budget", "spending", "income", "financial", "account"],
  },
  {
    id: "goal-management",
    name: "Goal Management",
    description:
      "Can help user create/manage/update/delete: {goal, spending, income}, and analyze the financial situation of the user as well as other financial accounts",
    keywords: ["goal", "financial", "account"],
  },
  {
    id: "get-financial-concepts-videos",
    name: "Get Financial Concepts Videos",
    description: "Can help user get financial concepts videos url",
    keywords: ["financial", "concepts", "videos", "url"],
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
            ChatToolId.BUDGET_TOOL,
            ChatToolId.LOAN_CALCULATOR,
            ChatToolId.INTEREST_CALCULATOR,
            ChatToolId.SALARY_CALCULATOR,
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
          enum: [
            ChatComponentId.BUDGET_OVERVIEW,
            ChatComponentId.BUDGET_DETAIL,
            ChatComponentId.SUGGESTIONS,
            ChatComponentId.GOAL_DASHBOARD,
            ChatComponentId.BUDGETING_DASHBOARD,
            ChatComponentId.MONTHLY_BUDGET_ANALYSIS,
          ],
        },
        title: {
          type: "string",
          description: "Title of the component",
        },
        context: {
          type: "object",
          description:
            "Additional context or parameters for the component. REQUIRED FOR COMPONENTS: suggestions",
          properties: {
            suggestions: {
              type: "array",
              description: "Suggestions to the user",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    description: "Unique suggestion identifier",
                  },
                  text: {
                    type: "string",
                    description: "Display text for the suggestion button",
                  },
                  description: {
                    type: "string",
                    description: "Optional additional description",
                  },
                },
                required: ["id", "text"],
              },
            },
          },
        },
      },
      required: ["component_id", "title"],
    },
  },
  {
    type: "function",
    strict: false,
    name: UIActionType.SHOW_VIDEO,
    description:
      "Show a specific video to the user, you must call MCP tool to get the video url before call this function",
    parameters: {
      type: "object",
      properties: {
        video_url: {
          type: "string",
          description: "URL of the video to show",
        },
        title: {
          type: "string",
          description: "Title of the video",
        },
      },
      required: ["video_url", "title"],
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

export function getComponentToolsInfo(): string {
  return componentTools
    .map(
      (component) =>
        `Component ID: "${component.id}" | Name: "${component.name}" | Description: "${component.description}"`
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
