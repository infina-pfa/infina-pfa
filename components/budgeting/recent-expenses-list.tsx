"use client";

import { ChevronRight } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { ExpenseItem } from "./expense-item";
import { EditExpenseModal } from "./edit-expense-modal";
import { useState } from "react";
import { BUDGET_COLORS } from "@/lib/utils/budget-constants";
import Link from "next/link";

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  type: string;
  description: string | null;
  budgetName?: string;
  budgetColor?: string;
}

interface RecentExpensesListProps {
  transactions: Transaction[];
  onExpenseUpdated?: (name: string, amount: number, oldAmount?: number) => void;
}

export const RecentExpensesList = ({
  transactions,
  onExpenseUpdated,
}: RecentExpensesListProps) => {
  const { t } = useAppTranslation("budgeting");
  const defaultColor = BUDGET_COLORS[0];

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<{
    id: string;
    name: string;
    amount: number;
    date: string;
    description?: string | null;
    budgetName?: string;
  } | null>(null);

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

  const handleEditSuccess = (
    name: string,
    amount: number,
    oldAmount?: number
  ) => {
    onExpenseUpdated?.(name, amount, oldAmount);
    setIsEditModalOpen(false);
    setSelectedExpense(null);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setSelectedExpense(null);
  };

  return (
    <>
      <section className="mx-4 md:mx-6">
        <div className="py-4 flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-[#FFFFFF] rounded-t-xl">
          <h2 className="text-[16px] md:text-[18px] font-semibold text-[#111827] font-nunito leading-[20px] md:leading-[24px]">
            {t("recentExpenses")}
          </h2>

          <Link href="/budgeting/transactions">
            <Button
              variant="link"
              size="sm"
              className="text-[#0055FF] font-nunito hover:text-[#0041CC] cursor-pointer p-0 h-auto text-sm md:text-base"
            >
              {t("viewAll", { ns: "common" })}
              <ChevronRight className="h-4 w-4 ml-1 md:ml-2" />
            </Button>
          </Link>
        </div>

        <div className="bg-[#FFFFFF] rounded-b-xl overflow-hidden">
          {transactions.map((expense, index) => (
            <div key={expense.id}>
              <ExpenseItem
                id={expense.id}
                name={expense.name}
                amount={expense.amount}
                date={expense.date}
                category={expense.category}
                budgetName={expense.budgetName}
                budgetColor={expense.budgetColor || defaultColor}
                description={expense.description}
                onEdit={handleEditExpense}
              />
              {index < transactions.length - 1 && (
                <div className="h-px bg-[#E5E7EB] mx-4 md:mx-6" />
              )}
            </div>
          ))}
        </div>

        {transactions.length === 0 && (
          <div className="px-4 md:px-6 py-6 md:py-8 text-center bg-[#FFFFFF] rounded-xl">
            <p className="text-[#6B7280] font-nunito text-[14px] md:text-[16px] leading-[20px] md:leading-[24px]">
              {t("noRecentExpenses")}
            </p>
            <p className="text-[12px] md:text-[14px] text-[#6B7280] mt-2 font-nunito leading-[16px] md:leading-[20px]">
              {t("startTrackingExpenses")}
            </p>
          </div>
        )}
      </section>

      <EditExpenseModal
        isOpen={isEditModalOpen}
        onClose={handleEditClose}
        onSuccess={handleEditSuccess}
        expense={selectedExpense}
      />
    </>
  );
};
