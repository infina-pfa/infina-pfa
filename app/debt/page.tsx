"use client";

import { useDebts } from "@/hooks/swr/debt";
import { DebtSummaryHeader } from "@/components/debt/debt-summary-header";
import { DebtList } from "@/components/debt/debt-list";

export default function DebtPage() {
  const { debts, isLoading } = useDebts();

  // Calculate summary data
  const totalAmount = debts?.reduce((sum, debt) => sum + debt.amount, 0) || 0;
  const nearestDueDate = debts?.reduce((nearest, debt) => {
    const debtDate = new Date(debt.dueDate);
    return !nearest || debtDate < nearest ? debtDate : nearest;
  }, null as Date | null) || null;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="space-y-4">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <DebtSummaryHeader 
        summaryData={{
          totalAmount,
          nearestDueDate
        }} 
      />
      <DebtList debts={debts} />
    </div>
  );
}
