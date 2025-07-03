"use client";

import { useAppTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/lib/utils";
import { ProgressBar } from "./progress-bar";
import { Card, CardContent } from "@/components/ui/card";
import { BudgetActionsMenu } from "./budget-actions-menu";

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
  onDelete?: (id: string) => void;
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
  onDelete,
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
        <div className="flex flex-col gap-3 md:gap-4">
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

            {/* Budget Actions Menu */}
            <BudgetActionsMenu
              id={id}
              onAddExpense={onAddExpense}
              onEdit={onEdit}
              onDelete={onDelete}
            />
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
