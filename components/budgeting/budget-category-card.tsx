"use client";

import { Edit } from "lucide-react";
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
  onEdit?: (id: string) => void;
}

export const BudgetCategoryCard = ({
  id,
  name,
  icon,
  spent,
  budget,
  remaining,
  onEdit,
}: BudgetCategoryCardProps) => {
  const { t } = useAppTranslation("budgeting");
  const spentPercentage = budget > 0 ? (spent / budget) * 100 : 0;

  return (
    <Card className="cursor-pointer duration-150 p-0" tabIndex={0}>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[16px] font-semibold text-[#111827] font-nunito leading-[24px]">
              {name}
            </h3>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(id);
                }}
                className="h-8 w-8 p-0 text-[#6B7280] hover:text-[#0055FF] hover:bg-[#F0F2F5]"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p className="text-[14px] font-regular text-[#6B7280] mb-2 font-nunito leading-[20px]">
            {t("spent")} {formatCurrency(spent)}/{formatCurrency(budget)}
          </p>

          <p className="text-[14px] font-regular text-[#6B7280] mb-4 font-nunito leading-[20px]">
            {t("remaining")} {formatCurrency(remaining)}
          </p>

          <ProgressBar value={spentPercentage} />
        </div>
      </CardContent>
    </Card>
  );
};
