"use client";

import { formatCurrency } from "@/lib/utils";
import { formatDateVN } from "@/lib/utils/date-formatter";
import { useAppTranslation } from "@/hooks/use-translation";
import { Transaction } from "@/lib/types/transaction.types";

interface GoalTransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
}

export function GoalTransactionList({
  transactions,
  loading = false,
}: GoalTransactionListProps) {
  const { t } = useAppTranslation(["goals"]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[18px] md:text-[20px] font-bold text-[#111827] font-nunito">
          {t("recentTransactions")}
        </h2>
        <button className="text-[#0055FF] text-[14px] font-medium font-nunito">
          {t("viewAllTransactions")}
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-[#E0E0E0]"
            >
              <div className="space-y-2">
                <div className="animate-pulse bg-[#E5E7EB] h-4 w-32 rounded"></div>
                <div className="animate-pulse bg-[#E5E7EB] h-3 w-20 rounded"></div>
              </div>
              <div className="animate-pulse bg-[#E5E7EB] h-4 w-24 rounded"></div>
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-[#6B7280] font-nunito text-[14px]">
            {t("noTransactionsFound")}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between py-3 border-b border-[#E0E0E0] last:border-0"
            >
              <div>
                <p className="font-medium text-[14px] md:text-[16px] text-[#111827] font-nunito">
                  {transaction.description || transaction.name}
                </p>
                <p className="text-[12px] md:text-[14px] text-[#6B7280] font-nunito">
                  {formatDateVN(transaction.created_at)}
                </p>
              </div>
              <p
                className={`font-semibold text-[14px] md:text-[16px] font-nunito ${
                  transaction.type === "outcome"
                    ? "text-[#F44336]"
                    : "text-[#2ECC71]"
                }`}
              >
                {transaction.type === "outcome" ? "-" : "+"}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
