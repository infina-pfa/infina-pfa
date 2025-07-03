import { ChatTool, FunctionTool, UIActionType } from "../types/index.ts";

export const chatTools: ChatTool[] = [
  {
    id: 'budget-tool',
    name: 'Công cụ Ngân sách',
    description: 'Giúp người dùng tạo và quản lý ngân sách cá nhân',
    keywords: ['ngân sách', 'budget', 'chi tiêu', 'tiết kiệm', 'quản lý tiền']
  },
  {
    id: 'loan-calculator',
    name: 'Công cụ tính lãi vay',
    description: 'Tính toán lãi suất và lịch trả nợ cho các khoản vay',
    keywords: ['tính vay', 'vay tiền', 'lãi vay', 'loan', 'tín dụng', 'trả nợ']
  },
  {
    id: 'interest-calculator',
    name: 'Công cụ tính lãi tiết kiệm',
    description: 'Tính toán lãi suất tiền gửi tiết kiệm',
    keywords: ['tính lãi', 'lãi suất', 'tiết kiệm', 'interest', 'tiền gửi']
  },
  {
    id: 'salary-calculator',
    name: 'Công cụ tính lương',
    description: 'Tính lương gross sang net và các khoản khấu trừ',
    keywords: ['tính lương', 'lương net', 'lương gross', 'salary', 'thuế thu nhập']
  },
  {
    id: 'bank-interest-compare',
    name: 'So sánh lãi suất ngân hàng',
    description: 'So sánh lãi suất tiền gửi của các ngân hàng',
    keywords: ['so sánh lãi suất', 'lãi suất ngân hàng', 'bank interest', 'ngân hàng']
  },
  {
    id: 'learning-center',
    name: 'Hành trình Học tập',
    description: 'Hiển thị hành trình học tập thực tế của người dùng với milestone và task cụ thể dựa trên dữ liệu thật',
    keywords: ['học', 'kiến thức', 'tài chính', 'learning', 'bài học', 'hành trình', 'milestone', 'task', 'progress', 'tiến độ']
  }
];

export const mcpToolsList = [
  {
    id: 'personal-finance-management',
    name: 'Quản lý tài chính cá nhân',
    description: 'Có thể giúp user tạo/quản lý/cập nhật/xoá: {ngân sách, chi tiêu, thu nhập}, và phân tích tình hình tài chính cá nhân cũng như các tài khoản tài chính khác',
    keywords: []
  }
];

export const functionTools: FunctionTool[] = [
  {
    type: "function" as const,
    name: UIActionType.OPEN_TOOL,
    description: "Open a specific financial tool for the user when they need practical assistance",
    parameters: {
      type: "object",
      properties: {
        tool_id: {
          type: "string",
          description: "ID of the tool to open",
          enum: ["budget-tool", "loan-calculator", "interest-calculator", "salary-calculator", "bank-interest-compare", "learning-center"]
        },
        title: {
          type: "string",
          description: "Title or reason for opening the tool"
        },
        context: {
          type: "object",
          description: "Additional context or parameters for the tool"
        },
        trigger_reason: {
          type: "string",
          description: "Explanation for why this tool should be opened"
        }
      },
      required: ["tool_id", "title", "trigger_reason"]
    }
  },
  {
    type: "function" as const,
    name: UIActionType.SHOW_COMPONENT,
    description: "Show a specific component to the user instead of long information",
    parameters: {
      type: "object",
      properties: {
        component_id: {
          type: "string",
          description: "ID of the component to show",
          enum: ["budget-overview", "budget-detail", "expense-summary", "income-summary", "financial-dashboard"]
        },
        title: {
          type: "string",
          description: "Title of the component"
        },
        context: {
          type: "object",
          description: "Additional context or parameters for the component"
        }
      },
      required: ["component_id", "title"]
    }
  },
  {
    type: "function" as const,
    name: UIActionType.SHOW_SUGGESTION,
    description: "Show a contextual suggestion card to the user",
    parameters: {
      type: "object",
      properties: {
        suggestion_type: {
          type: "string",
          description: "Type of suggestion",
          enum: ["tip", "warning", "recommendation", "insight"]
        },
        title: {
          type: "string",
          description: "Title of the suggestion"
        },
        content: {
          type: "string",
          description: "Content of the suggestion"
        }
      },
      required: ["suggestion_type", "title", "content"]
    }
  }
];

export function getToolsInfo(): string {
  return chatTools.map(tool => 
    `Tool ID: "${tool.id}" | Tên: "${tool.name}" | Mô tả: "${tool.description}" | Từ khóa: [${tool.keywords.join(', ')}]`
  ).join('\n');
}

export function getMcpToolsInfo(): string {
  return mcpToolsList.map(tool => 
    `Tool ID: "${tool.id}" | Tên: "${tool.name}" | Mô tả: "${tool.description}" | Từ khóa: [${tool.keywords.join(', ')}]`
  ).join('\n');
} 