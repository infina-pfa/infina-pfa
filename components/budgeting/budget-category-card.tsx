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
      <CardContent className="flex items-center gap-4 p-6">
        <div
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}20` }}
        >
          <div style={{ color: color }}>{icon}</div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[16px] font-semibold text-[#111827] font-nunito leading-[24px]">
              {name}
            </h3>
            <div className="flex items-center gap-2">
              {onAddExpense && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddExpense(id);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">{t("addExpense")}</span>
                </Button>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <p className="text-[14px] font-bold text-[#6B7280] font-nunito leading-[20px]">
              {t("spent")}: {formatCurrency(spent)}
            </p>

            <p className="text-[14px] font-bold text-[#6B7280] font-nunito leading-[20px]">
              {t("remaining")}: {formatCurrency(remaining)}
            </p>
          </div>

          <ProgressBar value={spentPercentage} color={color} />
        </div>
      </CardContent>
    </Card>
  );
};
