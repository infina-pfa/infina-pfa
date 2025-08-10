"use client";

import { useMemo } from "react";
import { useBudgetListSWR } from "@/hooks/swr-v2/use-budget-list";
import { useAppTranslation } from "@/hooks/use-translation";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressBar } from "@/components/budgeting/progress-bar";

interface BudgetSummaryProps {
  onDataReady?: (data: {
    totalBudget: number;
    totalSpent: number;
    remaining: number;
    spendingPercentage: number;
  }) => void;
}

export const BudgetSummary = ({ onDataReady }: BudgetSummaryProps) => {
  const { t } = useAppTranslation(["budgeting", "common"]);

  const currentDate = new Date();
  const filter = useMemo(
    () => ({
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    }),
    []
  );

  const { totalBudget, totalSpent, loading, error } = useBudgetListSWR(filter);
  const remaining = totalBudget - totalSpent;
  const spendingPercentage =
    totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Call onDataReady when data is available
  useMemo(() => {
    if (!loading && !error && totalBudget > 0 && onDataReady) {
      onDataReady({
        totalBudget,
        totalSpent,
        remaining,
        spendingPercentage,
      });
    }
  }, [
    loading,
    error,
    totalBudget,
    totalSpent,
    remaining,
    spendingPercentage,
    onDataReady,
  ]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  if (error) {
    return (
      <div className="text-center text-red-500 p-3">
        {t("failedToLoadBudgets", { ns: "budgeting" })}
      </div>
    );
  }

  const hasBudgetData = totalBudget > 0 || totalSpent > 0;

  if (!loading && !hasBudgetData) {
    return null;
  }

  const monthName = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).toLocaleString("vi", { month: "long" });

  return (
    <div className="mt-4 mb-2 w-[50%]">
      {loading ? (
        <Skeleton className="w-full h-20" />
      ) : (
        <div className="p-4 bg-white rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-bold text-gray-800 font-nunito">
              {t("monthlySummary", { ns: "budgeting" })} - {monthName}
            </h3>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{formatCurrency(totalSpent)}</span>
              <span className="font-medium">{formatCurrency(totalBudget)}</span>
            </div>
            <ProgressBar
              value={spendingPercentage}
              color={spendingPercentage > 90 ? "#F44336" : "#0055FF"}
              className="h-2"
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{t("totalSpent", { ns: "budgeting" })}</span>
            <span>{t("totalBudget", { ns: "budgeting" })}</span>
          </div>
        </div>
      )}
    </div>
  );
};
