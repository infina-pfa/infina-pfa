"use client";

import { DebtListItemProps, DebtListItem } from "./debt-list-item";
import { useAppTranslation } from "@/hooks/use-translation";

export interface DebtListProps {
  debts: DebtListItemProps[];
  onDebtClick?: (debtId?: string) => void;
  className?: string;
  emptyMessage?: string;
}

export function DebtList({
  debts,
  onDebtClick,
  className = "",
  emptyMessage,
}: DebtListProps) {
  const { t } = useAppTranslation(["debt", "common"]);

  const handleDebtClick = (debt: DebtListItemProps) => {
    onDebtClick?.(debt.id);
  };

  if (debts.length === 0) {
    return (
      <div className={`text-center py-8 sm:py-12 px-4 ${className}`}>
        <div className="text-gray-400 text-2xl sm:text-3xl mb-3">📋</div>
        <p className="text-gray-500 text-sm sm:text-base max-w-sm mx-auto">
          {emptyMessage || t("noDebtsFound", { ns: "debt" })}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 sm:space-y-3 ${className}`}>
      {debts.map((debt, index) => (
        <DebtListItem
          key={debt.id || index}
          {...debt}
          onClick={() => handleDebtClick(debt)}
        />
      ))}
    </div>
  );
}
