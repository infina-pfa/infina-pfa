"use client";

import { Edit, Plus } from "lucide-react";
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
      className="cursor-pointer duration-150 p-0 transition-colors"
      tabIndex={0}
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
            <div className="flex items-center gap-1">
              {onAddExpense && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddExpense(id);
                  }}
                  className="h-8 w-8 p-0 text-[#6B7280] transition-colors"
                  style={
                    {
                      "--hover-color": color,
                      "--hover-bg": `${color}20`,
                    } as React.CSSProperties
                  }
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = color;
                    e.currentTarget.style.backgroundColor = `${color}20`;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = "#6B7280";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  title={t("addExpense")}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(id);
                  }}
                  className="h-8 w-8 p-0 text-[#6B7280] transition-colors"
                  style={
                    {
                      "--hover-color": color,
                      "--hover-bg": `${color}20`,
                    } as React.CSSProperties
                  }
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = color;
                    e.currentTarget.style.backgroundColor = `${color}20`;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = "#6B7280";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  title={t("editBudget")}
                >
                  <Edit className="h-4 w-4" />
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
