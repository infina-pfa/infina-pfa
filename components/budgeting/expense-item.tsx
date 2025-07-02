"use client";

import { formatCurrency } from "@/lib/utils";

interface ExpenseItemProps {
  id: string;
  name: string;
  amount: number;
  date: string;
  category?: string;
  budgetName?: string;
}

export const ExpenseItem = ({
  name,
  amount,
  date,
  budgetName,
}: ExpenseItemProps) => {
  return (
    <div
      className="flex items-center justify-between p-6 bg-[#FFFFFF] cursor-pointer"
      tabIndex={0}
    >
      <div className="flex-1">
        <h3 className="text-[16px] font-semibold text-[#111827] mb-2 font-nunito leading-[24px]">
          {name}
        </h3>

        {budgetName && (
          <p className="text-[14px] text-[#6B7280] font-nunito leading-[20px]">
            {budgetName}
          </p>
        )}
      </div>

      <div className="text-right">
        <p className="text-[20px] font-semibold text-[#111827] font-nunito leading-[28px]">
          {formatCurrency(amount)}
        </p>
        <p className="text-[14px] text-[#6B7280] font-nunito leading-[20px] mt-1">
          {date}
        </p>
      </div>
    </div>
  );
};
