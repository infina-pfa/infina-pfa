"use client";

import { useMemo } from "react";
import { useFinancialOverviewSWR } from "@/hooks/swr/use-financial-overview";
import { useAppTranslation } from "@/hooks/use-translation";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressBar } from "@/components/budgeting/progress-bar";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface FinancialOverviewCardProps {
  month?: number;
  year?: number;
}

export const FinancialOverviewCard = ({
  month,
  year,
}: FinancialOverviewCardProps) => {
  const { t } = useAppTranslation(["budgeting", "common"]);

  const currentDate = new Date();
  const filter = useMemo(
    () => ({
      month: month || currentDate.getMonth() + 1,
      year: year || currentDate.getFullYear(),
    }),
    [month, year]
  );

  const { overview, loading, error } = useFinancialOverviewSWR(filter);

  if (error) {
    return (
      <div className="text-center text-red-500 p-3 text-sm">
        {t("failedToLoadBudgets", { ns: "budgeting" })}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full">
        <Skeleton className="w-full h-[200px] rounded-lg" />
      </div>
    );
  }

  if (!overview || !overview.budgets || overview.budgets.items.length === 0) {
    return (
      <div className="text-center text-gray-500 p-3 text-sm">
        {t("noBudgetsYet", { ns: "budgeting" })}
      </div>
    );
  }

  // Calculate overall spending percentage
  const totalBudget = overview.budgets.total;
  const totalSpent = overview.budgets.spent;
  const spendingPercentage =
    totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Get top 3 budgets by spending percentage
  const topBudgets = [...overview.budgets.items]
    .sort((a, b) => {
      const percentA = a.amount > 0 ? (a.spent / a.amount) * 100 : 0;
      const percentB = b.amount > 0 ? (b.spent / b.amount) * 100 : 0;
      return percentB - percentA;
    })
    .slice(0, 3);

  const monthName = new Date(filter.year, filter.month - 1, 1).toLocaleString(
    "vi",
    { month: "long" }
  );

  return (
    <Card className="w-full overflow-hidden bg-white rounded-lg p-4">
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-800 font-nunito mb-2">
          {t("monthlySummary", { ns: "budgeting" })} - {monthName}
        </h3>

        {/* Overall Summary */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">
              {formatCurrency(totalSpent)}
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(totalBudget)}
            </span>
          </div>
          <ProgressBar
            value={spendingPercentage}
            color={spendingPercentage > 90 ? "#F44336" : "#0055FF"}
            className="h-2"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{t("totalSpent", { ns: "budgeting" })}</span>
            <span>{t("totalBudget", { ns: "budgeting" })}</span>
          </div>
        </div>

        {/* Income vs Expense */}
        <div className="flex justify-between items-center mb-4 text-sm">
          <div>
            <p className="text-gray-500">
              {t("totalSelectedMonthIncome", { ns: "income" })}
            </p>
            <p className="font-semibold">
              {formatCurrency(overview.totalIncome)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">
              {t("totalSpent", { ns: "budgeting" })}
            </p>
            <p className="font-semibold">
              {formatCurrency(overview.totalExpense)}
            </p>
          </div>
        </div>

        {/* Top 3 Budgets */}
        {topBudgets.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">
              {t("topCategories", { ns: "budgeting" })}
            </h4>
            <div className="space-y-3">
              {topBudgets.map((budget) => {
                const budgetPercentage =
                  budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
                return (
                  <div key={budget.id} className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: budget.color }}
                        ></div>
                        <span className="text-xs font-medium">
                          {budget.name}
                        </span>
                      </div>
                      <span className="text-xs">
                        {formatCurrency(budget.spent)} /{" "}
                        {formatCurrency(budget.amount)}
                      </span>
                    </div>
                    <ProgressBar
                      value={budgetPercentage}
                      color={budget.color}
                      className="h-1.5"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
