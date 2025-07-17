import { ChatComponentId, ChatToolId } from "@/lib/types/ai-streaming.types";
import { BudgetStyle } from "@/lib/types/user.types";
import { getDetailTrackerPrompt } from "./detail-tracker.prompt";
import { getGoalFocusedPrompt } from "./goal-focus.prompt";

export const getStartSavingPrompt = (options?: {
  context?: string;
  budgetStyle: BudgetStyle;
}) => {
  const { context, budgetStyle } = options || {};

  switch (budgetStyle) {
    case BudgetStyle.GOAL_FOCUSED:
      return getGoalFocusedPrompt(context);
    case BudgetStyle.DETAIL_TRACKER:
      return getDetailTrackerPrompt(context);
    default:
      return getGoalFocusedPrompt(context);
  }
};

export const getStartSavingTools = (options?: { budgetStyle: BudgetStyle }) => {
  const { budgetStyle } = options || {};

  switch (budgetStyle) {
    case BudgetStyle.GOAL_FOCUSED:
      return {
        chatTools: [],
        componentTools: [
          ChatComponentId.VIDEO,
          ChatComponentId.SUGGESTIONS,
          ChatComponentId.GOAL_DASHBOARD,
          ChatComponentId.PAY_YOURSELF_FIRST_CONFIRMATION,
          ChatComponentId.BUDGETING_DASHBOARD,
        ],
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
      };
  }
};
