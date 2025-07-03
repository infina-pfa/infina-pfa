"use client";

// import { useState } from "react"; // TODO: Re-add when CreateBudgetModal is implemented
import { AppLayout } from "@/components/ui/app-layout";
import { SpendingOverview } from "@/components/budgeting/spending-overview";
import { BudgetCategoriesList } from "@/components/budgeting/budget-categories-list";
import { RecentExpensesList } from "@/components/budgeting/recent-expenses-list";
import { CreateBudgetModal } from "@/components/budgeting/create-budget-modal";
import { EditBudgetModal } from "@/components/budgeting/edit-budget-modal";
import { CreateExpenseModal } from "@/components/budgeting/create-expense-modal";
import {
  useBudgetListWithSpending,
  useRecentTransactions,
} from "@/hooks/use-budget-list";
import { useBudgetStats } from "@/hooks/use-budget-stats";
import { useAppTranslation } from "@/hooks/use-translation";
import { useMemo, useState, useCallback } from "react";
import { Budget } from "@/lib/types/budget.types";

export default function BudgetingPage() {
  const { t } = useAppTranslation(["budgeting", "common"]);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateExpenseModalOpen, setIsCreateExpenseModalOpen] =
    useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

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
    refetch: refetchTransactions,
  } = useRecentTransactions(10);

  // Fetch budget statistics for future use
  const { loading: statsLoading, error: statsError } = useBudgetStats();

  // Combined refetch function for when data changes
  const handleDataRefresh = useCallback(async () => {
    await Promise.all([refetchBudgets(), refetchTransactions()]);
  }, [refetchBudgets, refetchTransactions]);

  // Handle edit budget
  const handleEditBudget = (budgetId: string) => {
    const budget = budgets.find((b) => b.id === budgetId);
    if (budget) {
      setSelectedBudget(budget);
      setIsEditModalOpen(true);
    }
  };

  // Handle add expense
  const handleAddExpense = (budgetId: string) => {
    const budget = budgets.find((b) => b.id === budgetId);
    if (budget) {
      setSelectedBudget(budget);
      setIsCreateExpenseModalOpen(true);
    }
  };

  const isLoading = budgetsLoading || statsLoading || transactionsLoading;
  const hasError = budgetsError || statsError || transactionsError;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0055FF] mx-auto mb-4"></div>
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
            <p className="text-[#F44336] font-nunito mb-4">
              {budgetsError || statsError || transactionsError}
            </p>
            <button
              onClick={handleDataRefresh}
              className="px-4 py-2 bg-[#0055FF] text-white rounded-lg font-nunito hover:bg-[#0041CC]"
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
              onEditBudget={handleEditBudget}
              onAddExpense={handleAddExpense}
            />
          </div>

          <div className="mt-8">
            <RecentExpensesList
              transactions={recentTransactions}
              onExpenseUpdated={handleDataRefresh}
            />
          </div>
        </main>
      </div>

      <CreateBudgetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleDataRefresh}
      />

      <EditBudgetModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBudget(null);
        }}
        onSuccess={handleDataRefresh}
        budget={selectedBudget}
      />

      <CreateExpenseModal
        isOpen={isCreateExpenseModalOpen}
        onClose={() => {
          setIsCreateExpenseModalOpen(false);
          setSelectedBudget(null);
        }}
        onSuccess={handleDataRefresh}
        budget={
          selectedBudget
            ? {
                id: selectedBudget.id,
                name: selectedBudget.name,
                color: selectedBudget.color,
              }
            : null
        }
      />
    </AppLayout>
  );
}
