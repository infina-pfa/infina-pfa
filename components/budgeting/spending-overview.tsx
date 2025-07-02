"use client";

import { useAppTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/lib/utils";

interface SpendingOverviewProps {
  totalSpent: number;
  totalBudget: number;
}

export const SpendingOverview = ({
  totalSpent,
  totalBudget,
}: SpendingOverviewProps) => {
  const { t } = useAppTranslation("budgeting");

  return (
    <section className="px-6 py-6 bg-[#FFFFFF] rounded-xl mx-6 mt-6">
      <h2 className="text-sm font-medium text-[#6B7280] mb-4 font-nunito">
        {t("spendingOverview")}
      </h2>

      <div className="flex items-baseline gap-1">
        <span className="text-[32px] font-bold text-[#111827] font-nunito leading-[40px]">
          {formatCurrency(totalSpent)}
        </span>
        <span className="text-[20px] font-medium text-[#6B7280] font-nunito leading-[28px]">
          /{formatCurrency(totalBudget)}
        </span>
      </div>
    </section>
  );
};
