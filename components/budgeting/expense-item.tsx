"use client";

import { formatCurrency } from "@/lib/utils";
import { Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUDGET_COLORS } from "@/lib/utils/budget-constants";

interface ExpenseItemProps {
  id: string;
  name: string;
  amount: number;
  date: string;
  category?: string;
  budgetName?: string;
  budgetColor?: string;
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
  budgetColor = BUDGET_COLORS[0],
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
    <div className="p-4 md:p-6 bg-[#FFFFFF] cursor-pointer" tabIndex={0}>
      {/* Mobile: Stack layout, Desktop: Side-by-side */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Title and Edit Button Row on Mobile */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-[14px] md:text-[16px] font-semibold text-[#111827] font-nunito leading-[20px] md:leading-[24px] flex-1 pr-2">
              {name}
            </h3>

            {/* Edit Button - Visible on mobile, hidden on desktop (will be shown in amount section) */}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="md:hidden flex-shrink-0 h-8 w-8 p-0 text-[#6B7280] hover:text-[#0055FF] hover:bg-[#F0F2F5]"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Budget Category */}
          {budgetName && (
            <div className="mb-2 md:mb-0">
              <p
                className="text-[12px] md:text-[14px] font-medium font-nunito leading-[16px] md:leading-[20px] inline-block px-2 py-0.5 rounded-md"
                style={{
                  color: budgetColor,
                  backgroundColor: `${budgetColor}20`, // 20% opacity
                }}
              >
                {budgetName}
              </p>
            </div>
          )}
        </div>

        {/* Amount and Date Section */}
        <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4">
          <div className="text-left md:text-right">
            <p className="text-[16px] md:text-[20px] font-semibold text-[#111827] font-nunito leading-[20px] md:leading-[28px]">
              {formatCurrency(amount)}
            </p>
            <p className="text-[12px] md:text-[14px] text-[#6B7280] font-nunito leading-[16px] md:leading-[20px] mt-0.5 md:mt-1">
              {date}
            </p>
          </div>

          {/* Edit Button - Hidden on mobile, visible on desktop */}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="hidden md:flex flex-shrink-0 h-8 w-8 p-0 text-[#6B7280] hover:text-[#0055FF] hover:bg-[#F0F2F5]"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
