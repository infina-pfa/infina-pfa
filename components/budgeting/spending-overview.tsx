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
    <section className="mx-4 md:mx-6 mt-4 md:mt-6 px-4 md:px-6 py-4 md:py-6 bg-[#FFFFFF] rounded-xl">
      <h2 className="text-sm font-medium text-[#6B7280] mb-3 md:mb-4 font-nunito">
        {t("spendingOverview")}
      </h2>

      <div className="flex items-baseline gap-1 flex-wrap">
        <span className="text-[24px] md:text-[32px] font-bold text-[#111827] font-nunito leading-[32px] md:leading-[40px] break-all">
          {formatCurrency(totalSpent)}
        </span>
        <span className="text-[18px] md:text-[24px] font-medium text-[#6B7280] font-nunito leading-[24px] md:leading-[32px] break-all">
          /{formatCurrency(totalBudget)}
        </span>
      </div>
    </section>
  );
};
