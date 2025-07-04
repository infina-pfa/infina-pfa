"use client";

import { AppLayout } from "@/components/ui/app-layout";
import { SpendingOverview } from "@/components/budgeting/spending-overview";
import { BudgetCategoriesList } from "@/components/budgeting/budget-categories-list";
import {
  RecentExpensesList,
  Transaction,
} from "@/components/budgeting/recent-expenses-list";
import { CreateBudgetModal } from "@/components/budgeting/create-budget-modal";
import { EditBudgetModal } from "@/components/budgeting/edit-budget-modal";
import { CreateExpenseModal } from "@/components/budgeting/create-expense-modal";
import { useBudgetManagementSWR, useRecentTransactionsSWR } from "@/hooks/swr";
import { useBudgetDeleteSWR } from "@/hooks/swr/use-budget-delete";
import { useBudgetStats } from "@/hooks/use-budget-stats";
import { useAppTranslation } from "@/hooks/use-translation";
import { useMemo, useState } from "react";
import { Budget } from "@/lib/types/budget.types";
import { useToast } from "@/hooks/use-toast";
import { formatDateVN } from "@/lib/utils/date-formatter";

export default function BudgetingPage() {
  const { t } = useAppTranslation(["budgeting", "common"]);
  const toast = useToast();

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateExpenseModalOpen, setIsCreateExpenseModalOpen] =
    useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

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

  // ✨ Use the combined SWR hook for budget management
  const {
    budgets,
    totalBudget,
    totalSpent,
    loading: budgetsLoading,
    error: budgetsError,
  } = useBudgetManagementSWR(filter);

  const {
    data: recentTransactions,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useRecentTransactionsSWR(10);

  // Map API transactions to component's Transaction type
  const mappedTransactions: Transaction[] = useMemo(() => {
    if (!recentTransactions) return [];

    return recentTransactions.map((transaction) => ({
      id: transaction.id,
      name: transaction.name,
      amount: transaction.amount,
      date: formatDateVN(transaction.created_at),
      category: transaction.budgetName || "Uncategorized",
      type: transaction.type,
      description: transaction.description,
      budgetName: transaction.budgetName,
      budgetColor: transaction.budgetColor,
    }));
  }, [recentTransactions]);

  // Use the budget delete hook
  const { deleteBudget, error: deleteError } = useBudgetDeleteSWR();

  // Keep budget statistics for future use
  const { loading: statsLoading, error: statsError } = useBudgetStats();

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

  // Handle delete budget
  const handleDeleteBudget = async (budgetId: string) => {
    const success = await deleteBudget(budgetId);

    if (success) {
      toast.success(t("budgetDeleted", { ns: "budgeting" }));
    } else if (deleteError) {
      toast.error(t("failedToDeleteBudget", { ns: "budgeting" }), deleteError);
    }
  };

  const isLoading = budgetsLoading || statsLoading || transactionsLoading;
  const hasError = budgetsError || statsError || transactionsError?.message;

  // Display the first error that occurs
  const errorMessage = budgetsError || statsError || transactionsError?.message;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
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
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-[#F44336] font-nunito mb-4">
              {errorMessage || t("error", { ns: "common" })}
            </p>
            <button
              onClick={() => window.location.reload()}
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
        <main className="pb-6 md:pb-8">
          <SpendingOverview totalSpent={totalSpent} totalBudget={totalBudget} />

          <div className="mt-6 md:mt-8">
            <BudgetCategoriesList
              budgets={budgets}
              onCreateBudget={() => setIsCreateModalOpen(true)}
              onEditBudget={handleEditBudget}
              onAddExpense={handleAddExpense}
              onDeleteBudget={handleDeleteBudget}
            />
          </div>

          <div className="mt-6 md:mt-8">
            {/* ✨ No need to pass onExpenseUpdated - SWR handles automatic updates */}
            <RecentExpensesList transactions={mappedTransactions} />
          </div>
        </main>
      </div>

      <CreateBudgetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          // The actual budget creation is handled in the budget-modal.tsx
          // which calls the createBudget function from useBudgetForm
          // We'll update useBudgetForm to use our SWR hook instead
          setIsCreateModalOpen(false);
        }}
      />

      <EditBudgetModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBudget(null);
        }}
        onSuccess={() => {
          // The actual budget update is handled in the budget-modal.tsx
          // which calls the updateBudget function from useBudgetForm
          // We'll update useBudgetForm to use our SWR hook instead
          setIsEditModalOpen(false);
          setSelectedBudget(null);
        }}
        budget={selectedBudget}
      />

      <CreateExpenseModal
        isOpen={isCreateExpenseModalOpen}
        onClose={() => {
          setIsCreateExpenseModalOpen(false);
          setSelectedBudget(null);
        }}
        onSuccess={() => {
          setIsCreateExpenseModalOpen(false);
          setSelectedBudget(null);
          // ✨ SWR automatically updates the data - no manual refetch needed!
        }}
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
