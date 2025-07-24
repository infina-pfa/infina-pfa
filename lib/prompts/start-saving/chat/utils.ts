import {
  ChatComponentId,
  ChatToolId,
  MCPId,
} from "@/lib/types/ai-streaming.types";
import { BudgetStyle } from "@/lib/types/user.types";
import { getDetailTrackerPrompt } from "./detail-tracker.prompt";
import { getGoalFocusedPrompt } from "./goal-focus.prompt";

export const getStartSavingPrompt = (options?: {
  context?: string;
  toolInfo?: string;
  budgetStyle: BudgetStyle;
}) => {
  const { context, toolInfo, budgetStyle } = options || {};

  switch (budgetStyle) {
    case BudgetStyle.GOAL_FOCUSED:
      return getGoalFocusedPrompt(context, toolInfo);
    case BudgetStyle.DETAIL_TRACKER:
      return getDetailTrackerPrompt(context, toolInfo);
    default:
      return getGoalFocusedPrompt(context, toolInfo);
  }
};

export const getStartSavingTools = (options?: { budgetStyle: BudgetStyle }) => {
  const { budgetStyle } = options || {};

  switch (budgetStyle) {
    case BudgetStyle.GOAL_FOCUSED:
      return {
        chatTools: [] as ChatToolId[],
        componentTools: [
          ChatComponentId.VIDEO,
          ChatComponentId.SUGGESTIONS,
          ChatComponentId.GOAL_DASHBOARD,
          ChatComponentId.PAY_YOURSELF_FIRST_CONFIRMATION,
          ChatComponentId.BUDGETING_DASHBOARD,
        ],
        mcpTools: [MCPId.GENERAL] as MCPId[],
      };
    case BudgetStyle.DETAIL_TRACKER:
      return {
        chatTools: [ChatToolId.BUDGET_TOOL, ChatToolId.SALARY_CALCULATOR],
        componentTools: [
          ChatComponentId.VIDEO,
          ChatComponentId.SUGGESTIONS,
          ChatComponentId.GOAL_DASHBOARD,
          ChatComponentId.PAY_YOURSELF_FIRST_CONFIRMATION,
          ChatComponentId.BUDGETING_DASHBOARD,
        ],
        mcpTools: [MCPId.GENERAL] as MCPId[],
      };
    default:
      return {
        chatTools: [] as ChatToolId[],
        componentTools: [],
        mcpTools: [] as MCPId[],
      };
  }
};
