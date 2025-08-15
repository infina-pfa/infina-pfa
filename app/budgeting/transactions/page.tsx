"use client";

import { EditExpenseModal } from "@/components/budgeting/edit-expense-modal";
import { ExpenseItem } from "@/components/budgeting/expense-item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { AppLayout } from "@/components/ui/app-layout";
import { useMonthlySpending } from "@/hooks/swr/budget/use-budget-spending";
import { useAppTranslation } from "@/hooks/use-translation";
import { TransactionResponse } from "@/lib/types/budget.types";
import { formatDateVN } from "@/lib/utils/date-formatter";
import { format, parseISO } from "date-fns";
import { useMemo, useState } from "react";

export default function TransactionsPage() {
  const { t } = useAppTranslation(["budgeting", "common"]);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<{
    id: string;
    name: string;
    amount: number;
    date: string;
    description?: string | null;
    budgetName?: string;
  } | null>(null);

  // Get transactions from the last 6 months using multiple hooks
  const today = new Date();
  
  // Calculate month/year for each of the last 6 months
  const getMonthYear = (monthsAgo: number) => {
    const date = new Date(today.getFullYear(), today.getMonth() - monthsAgo, 1);
    return { month: date.getMonth() + 1, year: date.getFullYear() };
  };
  
  const m0 = getMonthYear(0);
  const m1 = getMonthYear(1);
  const m2 = getMonthYear(2);
  const m3 = getMonthYear(3);
  const m4 = getMonthYear(4);
  const m5 = getMonthYear(5);
  
  // Use hooks for each month
  const { spending: spending0, isLoading: loading0, refetch: refetch0 } = useMonthlySpending(m0.month, m0.year);
  const { spending: spending1, isLoading: loading1, refetch: refetch1 } = useMonthlySpending(m1.month, m1.year);
  const { spending: spending2, isLoading: loading2, refetch: refetch2 } = useMonthlySpending(m2.month, m2.year);
  const { spending: spending3, isLoading: loading3, refetch: refetch3 } = useMonthlySpending(m3.month, m3.year);
  const { spending: spending4, isLoading: loading4, refetch: refetch4 } = useMonthlySpending(m4.month, m4.year);
  const { spending: spending5, isLoading: loading5, refetch: refetch5 } = useMonthlySpending(m5.month, m5.year);
  
  // Combine all transactions
  const transactions = useMemo(() => {
    const allSpending = [
      ...spending0,
      ...spending1,
      ...spending2,
      ...spending3,
      ...spending4,
      ...spending5
    ];
    
    // Sort by date (newest first)
    return allSpending.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [spending0, spending1, spending2, spending3, spending4, spending5]);
  
  const isLoading = loading0 || loading1 || loading2 || loading3 || loading4 || loading5;
  
  // Refresh all data
  const mutate = () => {
    refetch0();
    refetch1();
    refetch2();
    refetch3();
    refetch4();
    refetch5();
  };

  // Get unique budget names for filter
  const budgetNames = useMemo(() => {
    if (!transactions.length) return [];

    const names = transactions
      .filter((t) => t.type === "budget_spending" && t.budget?.name)
      .map((t) => t.budget.name);

    return Array.from(new Set(names)).sort();
  }, [transactions]);

  // Filter expenses by selected budget
  const filteredExpenses = useMemo(() => {
    if (!transactions.length) return [];

    let expenses = transactions.filter((t) => t.type === "budget_spending");

    if (selectedBudget && selectedBudget !== "allBudgets") {
      expenses = expenses.filter((e) => e.budget?.name === selectedBudget);
    }

    return expenses;
  }, [transactions, selectedBudget]);

  // Group expenses by month
  const groupedExpenses = useMemo(() => {
    if (!filteredExpenses.length) return [];

    const groups: Record<string, TransactionResponse[]> = {};

    filteredExpenses.forEach((expense) => {
      const date = parseISO(expense.createdAt);
      const monthYear = format(date, "MM/yyyy");

      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }

      groups[monthYear].push(expense);
    });

    // Sort months in descending order (newest first)
    return Object.entries(groups).sort((a, b) => {
      const dateA = new Date(a[0]);
      const dateB = new Date(b[0]);
      return dateB.getTime() - dateA.getTime();
    });
  }, [filteredExpenses]);

  const handleEditExpense = (expense: {
    id: string;
    name: string;
    amount: number;
    date: string;
    description?: string | null;
    budgetName?: string;
  }) => {
    setSelectedExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    mutate();
    setIsEditModalOpen(false);
    setSelectedExpense(null);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setSelectedExpense(null);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto pb-12">
        <div className="px-4 md:px-6 py-6">
          <h1 className="text-[24px] md:text-[28px] font-bold text-[#111827] font-nunito mb-6">
            {t("allTransactions")}
          </h1>

          {/* Filter by budget - Updated to use Shadcn Select */}
          <div className="mb-6">
            <Select
              value={selectedBudget || ""}
              onValueChange={(value) => setSelectedBudget(value || null)}
            >
              <SelectTrigger
                id="budget-filter"
                className="w-full md:w-[300px] bg-white"
              >
                <SelectValue placeholder={t("allBudgets")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allBudgets">{t("allBudgets")}</SelectItem>
                {budgetNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="py-8 text-center">
              <p className="text-[#6B7280]">{t("loading", { ns: "common" })}</p>
            </div>
          ) : groupedExpenses.length === 0 ? (
            <div className="py-8 text-center bg-[#FFFFFF] rounded-xl">
              <p className="text-[#6B7280] font-nunito text-[16px] leading-[24px]">
                {t("noTransactionsFound")}
              </p>
            </div>
          ) : (
            groupedExpenses.map(([month, expenses]) => (
              <div key={month} className="mb-8">
                <h2 className="text-[18px] md:text-[20px] font-semibold text-[#111827] font-nunito mb-4">
                  {month}
                </h2>
                <div className="bg-[#FFFFFF] rounded-xl overflow-hidden">
                  {expenses.map((expense, index) => (
                    <div key={expense.id}>
                      <ExpenseItem
                        id={expense.id}
                        name={expense.name}
                        amount={expense.amount}
                        date={formatDateVN(new Date(expense.createdAt))}
                        budgetName={expense.budget?.name}
                        budgetColor={expense.budget?.color}
                        description={expense.description}
                        onEdit={handleEditExpense}
                      />
                      {index < expenses.length - 1 && (
                        <div className="h-px bg-[#E5E7EB] mx-4 md:mx-6" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <EditExpenseModal
          isOpen={isEditModalOpen}
          onClose={handleEditClose}
          onSuccess={handleEditSuccess}
          expense={selectedExpense}
        />
      </div>
    </AppLayout>
  );
}
