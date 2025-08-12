"use client";

import { BudgetCategoriesList } from "@/components/budgeting/budget-categories-list";
import { CreateBudgetModal } from "@/components/budgeting/create-budget-modal";
import { CreateExpenseModal } from "@/components/budgeting/create-expense-modal";
import { EditBudgetModal } from "@/components/budgeting/edit-budget-modal";
import {
  RecentExpensesList,
  Transaction,
} from "@/components/budgeting/recent-expenses-list";
import { SpendingOverview } from "@/components/budgeting/spending-overview";
import {
  useBudgets,
  useDeleteBudget,
  useMonthlySpending,
} from "@/hooks/swr/budget";
import { useToast } from "@/hooks/use-toast";
import { useAppTranslation } from "@/hooks/use-translation";
import { BudgetResponse } from "@/lib/types/budget.types";
import { formatDateVN } from "@/lib/utils/date-formatter";
import { useMemo, useState } from "react";

interface BudgetingWidgetProps {
  onBudgetCreated?: (budget: BudgetResponse) => Promise<void>;
  onBudgetUpdated?: (
    budget: BudgetResponse,
    oldAmount?: number
  ) => Promise<void>;
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

export function BudgetingWidget({
  onBudgetCreated,
  onBudgetUpdated,
  onExpenseCreated,
  onExpenseUpdated,
}: BudgetingWidgetProps = {}) {
  const { t } = useAppTranslation(["budgeting", "common"]);
  const toast = useToast();

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateExpenseModalOpen, setIsCreateExpenseModalOpen] =
    useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetResponse | null>(
    null
  );

  // Get current month and year for filtering
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Use new budget hooks
  const {
    budgets,
    isLoading: budgetsLoading,
    isError: budgetsError,
  } = useBudgets(currentMonth, currentYear);

  // Use monthly spending hook to get all transactions
  const {
    spending: monthlySpending,
    isLoading: spendingLoading,
    isError: spendingError,
  } = useMonthlySpending(currentMonth, currentYear);

  // Calculate total budget and spent from budgets
  const totalBudget = useMemo(() => {
    return budgets?.reduce((sum, budget) => sum + budget.amount, 0) || 0;
  }, [budgets]);

  const totalSpent = useMemo(() => {
    return budgets?.reduce((sum, budget) => sum + budget.spent, 0) || 0;
  }, [budgets]);

  // Map API transactions to component's Transaction type
  const mappedTransactions: Transaction[] = useMemo(() => {
    if (!monthlySpending) return [];
    // Sort by date and take only the 10 most recent transactions
    const sortedTransactions = [...monthlySpending].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sortedTransactions.slice(0, 10).map((transaction) => ({
      id: transaction.id,
      name: transaction.name,
      amount: transaction.amount,
      date: formatDateVN(new Date(transaction.createdAt)),
      category: transaction.budget?.name || "Uncategorized",
      type: transaction.type,
      description: transaction.description,
      budgetName: transaction.budget?.name,
      budgetColor: transaction.budget?.color,
    }));
  }, [monthlySpending]);

  // Use the budget delete hook
  const { deleteBudget, isDeleting } = useDeleteBudget(
    currentMonth,
    currentYear
  );

  // Handle edit budget
  const handleEditBudget = (budgetId: string) => {
    const budget = budgets?.find((b) => b.id === budgetId);
    if (budget) {
      setSelectedBudget(budget);
      setIsEditModalOpen(true);
    }
  };

  // Handle add expense
  const handleAddExpense = (budgetId: string) => {
    const budget = budgets?.find((b) => b.id === budgetId);
    if (budget) {
      setSelectedBudget(budget);
      setIsCreateExpenseModalOpen(true);
    }
  };

  // Handle delete budget
  const handleDeleteBudget = async (budgetId: string) => {
    try {
      await deleteBudget(budgetId);
      toast.success(t("budgetDeleted", { ns: "budgeting" }));
    } catch (err) {
      const error = err as { code?: string; message?: string };
      if (error?.code) {
        toast.error(
          t(error.code, {
            ns: "errors",
            defaultValue:
              error.message || t("BUDGET_DELETE_FAILED", { ns: "errors" }),
          })
        );
      } else {
        toast.error(t("BUDGET_DELETE_FAILED", { ns: "errors" }));
      }
    }
  };

  const isLoading =
    budgetsLoading || spendingLoading || isDeleting;
  const hasError = budgetsError || spendingError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0055FF] mx-auto mb-4"></div>
          <p className="text-[#6B7280] font-nunito">
            {t("loading", { ns: "common" })}
          </p>
        </div>
      </div>
    );
  }

  if (hasError) {
    const error = (budgetsError || spendingError) as {
      code?: string;
      message?: string;
    };
    const errorMessage = error?.code
      ? t(error.code, {
          ns: "errors",
          defaultValue: error.message || t("UNKNOWN_ERROR", { ns: "errors" }),
        })
      : t("UNKNOWN_ERROR", { ns: "errors" });

    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#F44336] font-nunito mb-4">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#0055FF] text-white rounded-lg font-nunito hover:bg-[#0041CC]"
          >
            {t("retry", { ns: "common" })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <main>
        <SpendingOverview totalSpent={totalSpent} totalBudget={totalBudget} />

        <div className="mt-6 md:mt-8">
          <BudgetCategoriesList
            budgets={budgets || []}
            onCreateBudget={() => setIsCreateModalOpen(true)}
            onEditBudget={handleEditBudget}
            onAddExpense={handleAddExpense}
            onDeleteBudget={handleDeleteBudget}
          />
        </div>

        <div className="mt-6 md:mt-8">
          {/* ✨ No need to pass onExpenseUpdated - SWR handles automatic updates */}
          <RecentExpensesList
            transactions={mappedTransactions}
            onExpenseUpdated={onExpenseUpdated}
          />
        </div>
      </main>

      <CreateBudgetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
        }}
        onBudgetCreated={onBudgetCreated}
      />

      <EditBudgetModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBudget(null);
        }}
        onSuccess={() => {
          setIsEditModalOpen(false);
          setSelectedBudget(null);
        }}
        budget={selectedBudget}
        onBudgetUpdated={onBudgetUpdated}
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
        month={currentMonth}
        year={currentYear}
        onExpenseCreated={onExpenseCreated}
      />
    </div>
  );
}
