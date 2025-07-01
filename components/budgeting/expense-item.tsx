"use client";

import { formatCurrency } from "@/lib/utils";
import { useAppTranslation } from "@/hooks/use-translation";

interface ExpenseItemProps {
  id: string;
  name: string;
  amount: number;
  date: string;
  category?: string;
}

export const ExpenseItem = ({
  name,
  amount,
  date,
  category,
}: ExpenseItemProps) => {
  const { t } = useAppTranslation();

  return (
    <div
      className="flex items-center justify-between p-6 bg-[#FFFFFF] cursor-pointer hover:bg-[#F9FAFF] transition-colors duration-150"
      tabIndex={0}
    >
      <div className="flex-1">
        <h3 className="text-[16px] font-semibold text-[#111827] mb-2 font-nunito leading-[24px]">
          {name}
        </h3>

        {category && (
          <p className="text-[14px] text-[#6B7280] font-nunito leading-[20px]">
            {t("note")}
          </p>
        )}

        <p className="text-[14px] text-[#6B7280] font-nunito leading-[20px] mt-1">
          {date}
        </p>
      </div>

      <div className="text-right">
        <p className="text-[20px] font-semibold text-[#111827] font-nunito leading-[28px]">
          {formatCurrency(amount)}
        </p>
      </div>
    </div>
  );
};
