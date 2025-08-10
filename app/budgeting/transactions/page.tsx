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
import { useRecentTransactionsSWR } from "@/hooks/swr-v2/use-recent-transactions";
import { useAppTranslation } from "@/hooks/use-translation";
import { Transaction } from "@/lib/types/transaction.types";
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

  // Get transactions from the last 6 months
  const { data: transactions, isLoading, mutate } = useRecentTransactionsSWR(6);

  // Get unique budget names for filter
  const budgetNames = useMemo(() => {
    if (!transactions) return [];

    const names = transactions
      .filter((t) => t.type === "outcome" && t.budgetName)
      .map((t) => t.budgetName as string);

    return Array.from(new Set(names)).sort();
  }, [transactions]);

  // Filter expenses by selected budget
  const filteredExpenses = useMemo(() => {
    if (!transactions) return [];

    let expenses = transactions.filter((t) => t.type === "outcome");

    if (selectedBudget && selectedBudget !== "allBudgets") {
      expenses = expenses.filter((e) => e.budgetName === selectedBudget);
    }

    return expenses;
  }, [transactions, selectedBudget]);

  // Group expenses by month
  const groupedExpenses = useMemo(() => {
    if (!filteredExpenses.length) return [];

    const groups: Record<
      string,
      Array<Transaction & { budgetName?: string; budgetColor?: string }>
    > = {};

    filteredExpenses.forEach((expense) => {
      const date = parseISO(expense.created_at);
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
                        date={formatDateVN(new Date(expense.created_at))}
                        budgetName={expense.budgetName}
                        budgetColor={expense.budgetColor}
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
