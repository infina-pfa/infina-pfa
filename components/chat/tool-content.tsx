"use client";

import { useAppTranslation } from "@/hooks/use-translation";
import { ChatToolId } from "@/lib/types/ai-streaming.types";
import { Budget } from "@/lib/types/budget.types";
import { BudgetingWidget } from "../budgeting/budgeting-widget";
import { ToolCard } from "./tool-card";

interface ToolContentProps {
  toolId: ChatToolId | null;
  isMobile?: boolean;
  onBudgetCreated?: (budget: Budget) => Promise<void>;
  onBudgetUpdated?: (budget: Budget, oldAmount?: number) => Promise<void>;
  onExpenseCreated?: (
    name: string,
    amount: number,
    budgetName: string
  ) => Promise<void>;
  onExpenseUpdated?: (
    name: string,
    amount: number,
    oldAmount?: number
  ) => Promise<void>;
}

export function ToolContent({
  toolId,
  isMobile = false,
  onBudgetCreated,
  onBudgetUpdated,
  onExpenseCreated,
  onExpenseUpdated,
}: ToolContentProps) {
  const { t } = useAppTranslation(["chat", "common"]);

  if (!toolId) {
    return null;
  }

  const renderComponent = () => {
    switch (toolId) {
      case ChatToolId.BUDGET_TOOL:
        return (
          <BudgetingWidget
            onBudgetCreated={onBudgetCreated}
            onBudgetUpdated={onBudgetUpdated}
            onExpenseCreated={onExpenseCreated}
            onExpenseUpdated={onExpenseUpdated}
          />
        );

      case ChatToolId.LOAN_CALCULATOR:
        return (
          <ToolCard
            title={t("expenseTrackerTitle")}
            description={t("expenseTrackerDescription")}
            isPlaceholder
          />
        );

      case ChatToolId.INTEREST_CALCULATOR:
        return (
          <ToolCard
            title={t("goalPlannerTitle")}
            description={t("goalPlannerDescription")}
            isPlaceholder
          />
        );

      case ChatToolId.SALARY_CALCULATOR:
        return (
          <ToolCard
            title={t("investmentCalculatorTitle")}
            description={t("investmentCalculatorDescription")}
            isPlaceholder
          />
        );

      default:
        return (
          <ToolCard
            title={t("unknownComponentTitle")}
            description={t("unknownComponentDescription")}
            isPlaceholder
          />
        );
    }
  };

  return (
    <div
      className={isMobile ? "flex-1 flex-col h-full overflow-y-auto" : "p-6"}
    >
      {renderComponent()}
    </div>
  );
}
