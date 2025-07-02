"use client";

import { ChevronRight } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { ExpenseItem } from "./expense-item";

// Mock data based on the UI documentation
const mockExpenses = [
  {
    id: "1",
    name: "homeSavings",
    amount: 50000000,
    date: "20/06/2025",
    category: "savings",
  },
  {
    id: "2",
    name: "emergencyFund",
    amount: 250000000,
    date: "20/05/2025",
    category: "savings",
  },
  {
    id: "3",
    name: "debtPayment",
    amount: 50000000,
    date: "20/04/2025",
    category: "debt",
  },
];

export const RecentExpensesList = () => {
  const { t } = useAppTranslation("budgeting");

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
        {mockExpenses.map((expense, index) => (
          <div key={expense.id}>
            <ExpenseItem
              id={expense.id}
              name={t(expense.name)}
              amount={expense.amount}
              date={expense.date}
              category={expense.category}
            />
            {index < mockExpenses.length - 1 && (
              <div className="h-px bg-[#E5E7EB] mx-6" />
            )}
          </div>
        ))}
      </div>

      {mockExpenses.length === 0 && (
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
