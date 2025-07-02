"use client";

// import { useState } from "react"; // TODO: Re-add when CreateBudgetModal is implemented
import { AppLayout } from "@/components/ui/app-layout";
import { SpendingOverview } from "@/components/budgeting/spending-overview";
import { BudgetCategoriesList } from "@/components/budgeting/budget-categories-list";
import { RecentExpensesList } from "@/components/budgeting/recent-expenses-list";
import { CreateBudgetModal } from "@/components/budgeting/create-budget-modal";
import {
  useBudgetListWithSpending,
  useRecentTransactions,
} from "@/hooks/use-budget-list";
import { useBudgetStats } from "@/hooks/use-budget-stats";
import { useAppTranslation } from "@/hooks/use-translation";
import { useMemo, useState } from "react";

export default function BudgetingPage() {
  const { t } = useAppTranslation(["budgeting", "common"]);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  console.log("RENDERING BUDGETING PAGE");

  // Get current month and year for filtering
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Memoize filter object
  const filter = useMemo(
    () => ({
      month: currentMonth,
      year: currentYear,
    }),
    [currentMonth, currentYear]
  );

  // Use real data hooks
  const {
    budgets,
    totalBudget,
    totalSpent,
    loading: budgetsLoading,
    error: budgetsError,
    refetch: refetchBudgets,
  } = useBudgetListWithSpending(filter);

  const {
    transactions: recentTransactions,
    loading: transactionsLoading,
    error: transactionsError,
  } = useRecentTransactions(10);

  // Fetch budget statistics for future use
  const { loading: statsLoading, error: statsError } = useBudgetStats();

  const isLoading = budgetsLoading || statsLoading || transactionsLoading;
  const hasError = budgetsError || statsError || transactionsError;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0055FF] mx-auto mb-4"></div>
            <p className="text-[#6B7280] font-nunito">
              {t("loading", { ns: "common" })}
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (hasError) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
          <div className="text-center">
            <div className="text-[#F44336] font-nunito text-lg mb-4">
              {budgetsError || statsError || transactionsError}
            </div>
            <button
              onClick={() => {
                refetchBudgets();
              }}
              className="px-4 py-2 bg-[#0055FF] text-white rounded-lg hover:bg-blue-600 font-nunito"
            >
              {t("retry", { ns: "common" })}
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F9FAFB]">
        <main className="pb-8">
          <SpendingOverview totalSpent={totalSpent} totalBudget={totalBudget} />

          <div className="mt-8">
            <BudgetCategoriesList
              budgets={budgets}
              onCreateBudget={() => setIsCreateModalOpen(true)}
            />
          </div>

          <div className="mt-8">
            <RecentExpensesList transactions={recentTransactions} />
          </div>
        </main>
      </div>

      <CreateBudgetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refetchBudgets}
      />
    </AppLayout>
  );
}
