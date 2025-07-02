"use client";

import { ChevronRight } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { ExpenseItem } from "./expense-item";

interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  type: string;
  description: string | null;
}

interface RecentExpensesListProps {
  transactions: Transaction[];
}

export const RecentExpensesList = ({
  transactions,
}: RecentExpensesListProps) => {
  const { t } = useAppTranslation("budgeting");

  // Filter only outcome transactions (expenses)
  const expenses = transactions.filter(
    (transaction) => transaction.type === "outcome"
  );

  return (
    <section className="mx-6">
      <div className="flex items-center justify-between px-6 py-4 bg-[#FFFFFF] rounded-t-xl">
        <h2 className="text-[18px] font-semibold text-[#111827] font-nunito leading-[24px]">
          {t("recentExpenses")}
        </h2>

        <Button
          variant="link"
          size="sm"
          className="text-[#0055FF] font-nunito hover:text-[#0041CC] cursor-pointer"
        >
          {t("viewAllHistory")}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <div className="bg-[#FFFFFF] rounded-b-xl overflow-hidden">
        {expenses.map((expense, index) => (
          <div key={expense.id}>
            <ExpenseItem
              id={expense.id}
              name={expense.name}
              amount={expense.amount}
              date={expense.date}
              category={expense.category}
            />
            {index < expenses.length - 1 && (
              <div className="h-px bg-[#E5E7EB] mx-6" />
            )}
          </div>
        ))}
      </div>

      {expenses.length === 0 && (
        <div className="px-6 py-8 text-center bg-[#FFFFFF] rounded-xl">
          <p className="text-[#6B7280] font-nunito text-[16px] leading-[24px]">
            {t("noRecentExpenses")}
          </p>
          <p className="text-[14px] text-[#6B7280] mt-2 font-nunito leading-[20px]">
            {t("startTrackingExpenses")}
          </p>
        </div>
      )}
    </section>
  );
};
