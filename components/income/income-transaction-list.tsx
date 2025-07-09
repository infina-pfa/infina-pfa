"use client";

import { useAppTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Income } from "@/lib/types/income.types";
import { formatCurrency } from "@/lib/utils";

interface IncomeTransactionListProps {
  incomes: Income[];
  loading?: boolean;
  onCreateIncome: () => void;
  onEditIncome: (income: Income) => void;
}

export function IncomeTransactionList({
  incomes,
  loading = false,
  onCreateIncome,
  onEditIncome,
}: IncomeTransactionListProps) {
  const { t } = useAppTranslation(["income", "common"]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="bg-[#FFFFFF] rounded-[12px] p-4 md:p-6">
      {/* Header with title and create button - Mobile responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-[20px] md:text-[24px] font-bold text-[#111827] font-nunito">
          {t("incomeTransactions")}
        </h2>
        <Button
          onClick={onCreateIncome}
          disabled={loading}
          className="bg-[#0055FF] hover:bg-[#0041CC] text-white font-nunito px-6 py-3 rounded-[9999px] text-[14px] md:text-[16px] min-h-[44px] w-full sm:w-auto disabled:opacity-50"
        >
          {t("createIncome")}
        </Button>
      </div>

      {/* Transaction List - Mobile optimized */}
      <div className="space-y-0">
        {loading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 px-2">
                  <div className="flex-1 mb-2 sm:mb-0">
                    <div className="h-4 bg-[#E5E7EB] rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-[#E5E7EB] rounded w-1/2"></div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="h-4 bg-[#E5E7EB] rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : incomes.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <p className="text-[14px] md:text-[16px] text-[#6B7280] font-nunito mb-4">
              {t("noIncomeTransactions")}
            </p>
            <Button
              onClick={onCreateIncome}
              className="bg-[#0055FF] hover:bg-[#0041CC] text-white font-nunito px-6 py-3 rounded-[9999px] text-[14px] md:text-[16px] min-h-[44px]"
            >
              {t("createFirstIncome")}
            </Button>
          </div>
        ) : (
          incomes.map((income, index) => (
            <div
              key={income.id}
              onClick={() => onEditIncome(income)}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 md:py-4 cursor-pointer hover:bg-[#F9FAFB] transition-colors duration-150 ease-in-out min-h-[56px] px-2 -mx-2 rounded-lg"
              style={{
                borderBottom:
                  index < incomes.length - 1 ? "1px solid #E5E7EB" : "none",
              }}
              tabIndex={0}
              role="button"
              aria-label={`${t("editIncome")} ${income.name}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onEditIncome(income);
                }
              }}
            >
              {/* Left side - Income details */}
              <div className="flex-1 mb-2 sm:mb-0">
                <h3 className="text-[16px] font-medium text-[#111827] font-nunito mb-1 break-words">
                  {income.name}
                </h3>
                <p className="text-[12px] md:text-[14px] text-[#6B7280] font-nunito">
                  {formatDate(income.created_at)} •{" "}
                  {income.description || t("noCategory")}
                </p>
              </div>

              {/* Right side - Amount */}
              <div className="text-left sm:text-right">
                <p className="text-[16px] md:text-[16px] font-bold text-[#111827] font-nunito break-words">
                  {formatCurrency(income.amount)}
                </p>
                {income.recurring > 0 && (
                  <p className="text-[12px] text-[#6B7280] font-nunito">
                    {income.recurring === 7 && t("weekly")}
                    {income.recurring === 14 && t("biweekly")}
                    {income.recurring === 30 && t("monthly")}
                    {income.recurring === 90 && t("quarterly")}
                    {income.recurring === 365 && t("yearly")}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
