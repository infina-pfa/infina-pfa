import {
  ChatComponentId,
  ChatToolId,
  MCPId,
} from "@/lib/types/ai-streaming.types";
import { BudgetStyle } from "@/lib/types/user.types";
import { getDetailTrackerInvestingPrompt } from "./detail-tracker.prompt";
import { getGoalFocusedInvestingPrompt } from "./goal-focused.prompt";

export const getStartInvestingPrompt = (options?: {
  context?: string;
  toolInfo?: string;
  budgetStyle: BudgetStyle;
}) => {
  const { context, toolInfo, budgetStyle } = options || {};

  switch (budgetStyle) {
    case BudgetStyle.GOAL_FOCUSED:
      return getGoalFocusedInvestingPrompt(context, toolInfo);
    case BudgetStyle.DETAIL_TRACKER:
      return getDetailTrackerInvestingPrompt(context, toolInfo);
    default:
      return getGoalFocusedInvestingPrompt(context, toolInfo);
  }
};

export const getStartInvestingTools = (options?: {
  budgetStyle: BudgetStyle;
}) => {
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
          ChatToolId.INTEREST_CALCULATOR,
          ChatToolId.SALARY_CALCULATOR,
          ChatToolId.BUDGET_TOOL,
        ],
        componentTools: [
          ChatComponentId.BUDGETING_DASHBOARD,
          ChatComponentId.MONTHLY_BUDGET_ANALYSIS,
          ChatComponentId.GOAL_DASHBOARD,
          ChatComponentId.SUGGESTIONS,
          ChatComponentId.VIDEO,
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
