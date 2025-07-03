"use client";

import { Plus } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/lib/utils";
import { ProgressBar } from "./progress-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BudgetCategoryCardProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  spent: number;
  budget: number;
  remaining: number;
  color?: string;
  onEdit?: (id: string) => void;
  onAddExpense?: (id: string) => void;
}

export const BudgetCategoryCard = ({
  id,
  name,
  icon,
  spent,
  budget,
  remaining,
  color = "#0055FF",
  onEdit,
  onAddExpense,
}: BudgetCategoryCardProps) => {
  const { t } = useAppTranslation("budgeting");
  const spentPercentage = budget > 0 ? (spent / budget) * 100 : 0;

  return (
    <Card
      className="cursor-pointer duration-150 p-0 transition-colors hover:bg-[#F9FAFB]"
      tabIndex={0}
      onClick={() => onEdit && onEdit(id)}
    >
      <CardContent className="p-4 md:p-6">
        {/* Mobile: Stack layout, Desktop: Side-by-side */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
          {/* Icon and Title Row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full"
                style={{ backgroundColor: `${color}20` }}
              >
                <div style={{ color: color }}>{icon}</div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] md:text-[16px] font-semibold text-[#111827] font-nunito leading-[20px] md:leading-[24px] truncate">
                  {name}
                </h3>
              </div>
            </div>

            {/* Add Expense Button - Always visible on mobile for better UX */}
            {onAddExpense && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddExpense(id);
                }}
                className="flex-shrink-0 h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm border border-[#E5E7EB] hover:bg-[#F9FAFB]"
              >
                <Plus className="h-3 w-3 md:h-4 md:w-4" />
                <span className="ml-1 md:ml-2 hidden xs:inline">
                  {t("addExpense")}
                </span>
              </Button>
            )}
          </div>

          {/* Budget Information - Full width on mobile */}
          <div className="flex-1 md:min-w-0">
            {/* Spending Details */}
            <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1 xs:gap-2 mb-3 md:mb-4">
              <p className="text-[12px] md:text-[14px] font-bold text-[#6B7280] font-nunito leading-[16px] md:leading-[20px]">
                {t("spent")}: {formatCurrency(spent)}
              </p>

              <p className="text-[12px] md:text-[14px] font-bold text-[#6B7280] font-nunito leading-[16px] md:leading-[20px]">
                {t("remaining")}: {formatCurrency(remaining)}
              </p>
            </div>

            {/* Progress Bar */}
            <ProgressBar value={spentPercentage} color={color} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
