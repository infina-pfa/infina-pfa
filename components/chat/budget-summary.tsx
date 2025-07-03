"use client";

import { useMemo } from "react";
import { useBudgetListSWR } from "@/hooks/swr/use-budget-list";
import { useAppTranslation } from "@/hooks/use-translation";
import { Skeleton } from "@/components/ui/skeleton";
import { FinaIcon } from "@/components/ui/fina-icon";

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  loading: boolean;
  color: string;
}

const StatCard = ({ icon, label, value, loading, color }: StatCardProps) => (
  <div className="flex-1 p-4 bg-white rounded-lg flex items-center">
    {loading ? (
      <Skeleton className="w-full h-16" />
    ) : (
      <>
        <div
          className="p-3 rounded-full mr-4"
          style={{ backgroundColor: `${color}20` }}
        >
          <FinaIcon name={icon} className="w-6 h-6" style={{ color: color }} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-nunito">{label}</p>
          <p className="text-xl font-bold text-gray-800 font-nunito">{value}</p>
        </div>
      </>
    )}
  </div>
);

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
      <div className="text-center text-red-500 p-4">
        {t("failedToLoadBudgets", { ns: "budgeting" })}
      </div>
    );
  }

  const hasBudgetData = totalBudget > 0 || totalSpent > 0;

  if (!loading && !hasBudgetData) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-gray-800 font-nunito mb-4">
        {t("monthlySummary", { ns: "budgeting" })}
      </h3>
      <div className="flex gap-4">
        <StatCard
          icon="Wallet"
          label={t("totalBudget", { ns: "budgeting" })}
          value={formatCurrency(totalBudget)}
          loading={loading}
          color="#0055FF"
        />
        <StatCard
          icon="TrendingDown"
          label={t("totalSpent", { ns: "budgeting" })}
          value={formatCurrency(totalSpent)}
          loading={loading}
          color="#F44336"
        />
        <StatCard
          icon="CheckCircle"
          label={t("remaining", { ns: "budgeting" })}
          value={formatCurrency(remaining)}
          loading={loading}
          color="#2ECC71"
        />
      </div>
    </div>
  );
};
