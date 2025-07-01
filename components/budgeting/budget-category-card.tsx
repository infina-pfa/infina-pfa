"use client";

import { useAppTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/lib/utils";
import { ProgressBar } from "./progress-bar";

interface BudgetCategoryCardProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  spent: number;
  budget: number;
  remaining: number;
}

export const BudgetCategoryCard = ({
  name,
  icon,
  spent,
  budget,
  remaining,
}: BudgetCategoryCardProps) => {
  const { t } = useAppTranslation();
  const spentPercentage = budget > 0 ? (spent / budget) * 100 : 0;

  return (
    <div
      className="flex items-center gap-4 p-6 bg-[#FFFFFF] cursor-pointer hover:bg-[#F9FAFF] transition-colors duration-150"
      tabIndex={0}
    >
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-[16px] font-semibold text-[#111827] mb-2 font-nunito leading-[24px]">
          {name}
        </h3>

        <p className="text-[14px] font-regular text-[#6B7280] mb-2 font-nunito leading-[20px]">
          {t("spent")} {formatCurrency(spent)}/{formatCurrency(budget)}
        </p>

        <p className="text-[14px] font-regular text-[#6B7280] mb-4 font-nunito leading-[20px]">
          {t("remaining")} {formatCurrency(remaining)}
        </p>

        <ProgressBar value={spentPercentage} />
      </div>
    </div>
  );
};
