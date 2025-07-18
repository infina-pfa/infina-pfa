import { ChatComponent, Tool } from "../ai-advisor/types";
import {
  ChatComponentId,
  ChatTool,
  ChatToolId,
  MCPId,
  UIActionType,
} from "../types/ai-streaming.types";
import { MCP_TOOLS } from "./constant";

export const buildFunctionTools = (
  chatToolIds: ChatToolId[],
  componentToolIds: ChatComponentId[],
  mcpIds: MCPId[]
): Tool[] => {
  const functionTools: Tool[] = [];

  if (chatToolIds.length > 0) {
    functionTools.push({
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
            enum: chatToolIds,
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
    });
  }

  if (componentToolIds.length > 0) {
    functionTools.push({
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
              ChatComponentId.PAY_YOURSELF_FIRST_CONFIRMATION,
              ChatComponentId.BUDGETING_DASHBOARD,
              ChatComponentId.MONTHLY_BUDGET_ANALYSIS,
              ChatComponentId.SURPLUS_ALLOCATION,
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
    });
  }

  if (mcpIds.length > 0) {
    mcpIds.forEach((mcpId) => {
      functionTools.push(MCP_TOOLS[mcpId]);
    });
  }

  return functionTools;
};

export function getToolsInfo(tools: ChatTool[]): string {
  return tools
    .map(
      (tool) =>
        `Tool ID: "${tool.id}" | Tên: "${tool.name}" | Mô tả: "${
          tool.description
        }" | Từ khóa: [${tool.keywords.join(", ")}]`
    )
    .join("\n");
}

export function getComponentToolsInfo(componentTools: ChatComponent[]): string {
  return componentTools
    .map(
      (component) =>
        `Component ID: "${component.id}" | Name: "${component.name}" | Description: "${component.description}"`
    )
    .join("\n");
}

export function getMcpToolsInfo(mcpTools: ChatTool[]): string {
  return mcpTools
    .map(
      (tool) =>
        `Tool ID: "${tool.id}" | Tên: "${tool.name}" | Mô tả: "${
          tool.description
        }" | Từ khóa: [${tool.keywords.join(", ")}]`
    )
    .join("\n");
}
