import {
  ChatComponentId,
  ChatToolId,
  MCPId,
} from "@/lib/types/ai-streaming.types";
import { BudgetStyle } from "@/lib/types/user.types";
import { getDetailTrackerDebtPrompt } from "./detail-tracker.prompt";
import { getGoalFocusedDebtPrompt } from "./goal-focused.prompt";

export const getDebtPrompt = (options?: {
  context?: string;
  toolInfo?: string;
  budgetStyle: BudgetStyle;
}) => {
  const { context, toolInfo, budgetStyle } = options || {};

  switch (budgetStyle) {
    case BudgetStyle.GOAL_FOCUSED:
      return getGoalFocusedDebtPrompt(context, toolInfo);
    case BudgetStyle.DETAIL_TRACKER:
      return getDetailTrackerDebtPrompt(context, toolInfo);
    default:
      return getGoalFocusedDebtPrompt(context, toolInfo);
  }
};

export const getDebtTools = (options?: { budgetStyle: BudgetStyle }) => {
  const { budgetStyle } = options || {};

  switch (budgetStyle) {
    case BudgetStyle.GOAL_FOCUSED:
      return {
        chatTools: [] as ChatToolId[],
        componentTools: [
          ChatComponentId.GOAL_DASHBOARD,
          ChatComponentId.SUGGESTIONS,
          ChatComponentId.VIDEO,
          ChatComponentId.BUDGETING_DASHBOARD,
        ],
        mcpTools: [MCPId.GENERAL] as MCPId[],
      };
    case BudgetStyle.DETAIL_TRACKER:
      return {
        chatTools: [
          ChatToolId.BUDGET_TOOL,
          ChatToolId.SALARY_CALCULATOR,
          ChatToolId.LOAN_CALCULATOR,
          ChatToolId.INTEREST_CALCULATOR,
        ],
        componentTools: [
          ChatComponentId.BUDGETING_DASHBOARD,
          ChatComponentId.MONTHLY_BUDGET_ANALYSIS,
          ChatComponentId.SUGGESTIONS,
          ChatComponentId.VIDEO,
          ChatComponentId.GOAL_DASHBOARD,
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
