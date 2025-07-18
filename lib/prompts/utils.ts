import { ChatComponent } from "../ai-advisor/types";
import { ChatTool } from "../types/ai-streaming.types";
import { BudgetStyle, FinancialStage } from "../types/user.types";
import { getStartSavingPrompt } from "./start-saving/chat/utils";

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

export function getStagePrompt(
  stage: FinancialStage,
  options?: {
    context?: string;
    budgetStyle?: BudgetStyle;
  }
) {
  const { context, budgetStyle } = options || {};

  switch (stage) {
    case FinancialStage.START_SAVING:
      return getStartSavingPrompt({
        context,
        budgetStyle: budgetStyle || BudgetStyle.GOAL_FOCUSED,
      });
    default:
      return null;
  }
}
