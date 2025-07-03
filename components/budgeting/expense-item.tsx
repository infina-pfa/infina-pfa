"use client";

import { formatCurrency } from "@/lib/utils";
import { Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpenseItemProps {
  id: string;
  name: string;
  amount: number;
  date: string;
  category?: string;
  budgetName?: string;
  description?: string | null;
  onEdit?: (expense: {
    id: string;
    name: string;
    amount: number;
    date: string;
    description?: string | null;
    budgetName?: string;
  }) => void;
}

export const ExpenseItem = ({
  id,
  name,
  amount,
  date,
  budgetName,
  description,
  onEdit,
}: ExpenseItemProps) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.({
      id,
      name,
      amount,
      date,
      description,
      budgetName,
    });
  };

  return (
    <div
      className="flex items-center justify-between p-6 bg-[#FFFFFF] cursor-pointer hover:bg-[#F9FAFB] transition-colors"
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

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-[20px] font-semibold text-[#111827] font-nunito leading-[28px]">
            {formatCurrency(amount)}
          </p>
          <p className="text-[14px] text-[#6B7280] font-nunito leading-[20px] mt-1">
            {date}
          </p>
        </div>

        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 p-0 text-[#6B7280] hover:text-[#0055FF] hover:bg-[#F0F2F5]"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
