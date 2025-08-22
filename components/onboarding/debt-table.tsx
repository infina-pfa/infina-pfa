"use client";

import { formatCurrency } from "@/lib/utils";
import { useAppTranslation } from "@/hooks/use-translation";

export interface DebtTableRowProps {
  id?: string;
  lender: string;
  purpose: string;
  amount: number;
  rate: number;
}

export interface DebtTableProps {
  debts: DebtTableRowProps[];
  onRowClick?: (debtId?: string) => void;
  className?: string;
  emptyMessage?: string;
}

export function DebtTable({
  debts,
  onRowClick,
  className = "",
  emptyMessage,
}: DebtTableProps) {
  const { t } = useAppTranslation(["debt", "common"]);

  const handleRowClick = (debt: DebtTableRowProps) => {
    onRowClick?.(debt.id);
  };

  if (debts.length === 0) {
    return (
      <div className={`text-center py-8 sm:py-12 px-4 ${className}`}>
        <div className="text-gray-400 text-2xl sm:text-3xl mb-3">📊</div>
        <p className="text-gray-500 text-sm sm:text-base max-w-sm mx-auto">
          {emptyMessage || t("noDebtsFound", { ns: "debt" })}
        </p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-3">
        {debts.map((debt, index) => (
          <div
            key={debt.id || index}
            className="bg-white rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-[#F0F2F5] border border-gray-100"
            onClick={() => handleRowClick(debt)}
            data-debt-id={debt.id}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base text-gray-900 truncate">
                  {debt.lender}
                </h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                  {debt.purpose}
                </p>
              </div>
              <div className="text-right ml-3 flex-shrink-0">
                <p className="font-bold text-base text-gray-900">
                  {formatCurrency(debt.amount)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {debt.rate}%/{t("year", { ns: "common" })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white rounded-lg overflow-hidden border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t("lender", { ns: "debt" })}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t("purpose", { ns: "debt" })}
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t("amount", { ns: "debt" })}
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t("interestRate", { ns: "debt" })}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {debts.map((debt, index) => (
              <tr
                key={debt.id || index}
                className="cursor-pointer transition-all duration-200 hover:bg-[#F0F2F5]"
                onClick={() => handleRowClick(debt)}
                data-debt-id={debt.id}
              >
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">
                    {debt.lender}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-600 max-w-xs truncate">
                    {debt.purpose}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="font-bold text-gray-900">
                    {formatCurrency(debt.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-gray-600">
                    {debt.rate}%/{t("year", { ns: "common" })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Row */}
      {debts.length > 0 && (
        <div className="mt-4 bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
          <div className="flex justify-between items-center">
            <div className="font-semibold text-gray-900">
              {t("totalDebt", { ns: "debt" })} ({debts.length}{" "}
              {debts.length === 1
                ? t("debt", { ns: "debt" })
                : t("debts", { ns: "debt" })}
              )
            </div>
            <div className="font-bold text-lg text-gray-900">
              {formatCurrency(
                debts.reduce((total, debt) => total + debt.amount, 0)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
