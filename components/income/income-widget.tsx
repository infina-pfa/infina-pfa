"use client";

import { useIncomeListSWR } from "@/hooks/swr";
import { useAppTranslation } from "@/hooks/use-translation";
import { Income } from "@/lib/types/income.types";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

// Import simplified components
import { CreateIncomeModal } from "./create-income-modal";
import { EditIncomeModal } from "./edit-income-modal";
import { IncomeTransactionList } from "./income-transaction-list";

interface IncomeWidgetProps {
  onIncomeCreated?: (income: Income) => Promise<void>;
  onIncomeUpdated?: (income: Income) => Promise<void>;
}

export function IncomeWidget({
  onIncomeCreated,
  onIncomeUpdated,
}: IncomeWidgetProps = {}) {
  const { t } = useAppTranslation(["income", "common"]);

  // State
  const [selectedMonth] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);

  // Get month/year for filtering
  const month = selectedMonth.getMonth() + 1;
  const year = selectedMonth.getFullYear();

  // Fetch incomes using SWR
  const { incomes, loading, error, refetch } = useIncomeListSWR({
    month,
    year,
  });

  // Calculate total for selected month
  const totalMonthIncome = incomes.reduce(
    (sum, income) => sum + income.amount,
    0
  );

  // Handle edit income
  const handleEditIncome = (income: Income) => {
    setSelectedIncome(income);
    setIsEditModalOpen(true);
  };

  // Handle income creation success
  const handleIncomeCreated = async (income: Income) => {
    await refetch(); // Refresh the list
    if (onIncomeCreated) {
      await onIncomeCreated(income);
    }
  };

  // Handle income update success
  const handleIncomeUpdated = async (income: Income) => {
    await refetch(); // Refresh the list
    if (onIncomeUpdated) {
      await onIncomeUpdated(income);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Title - Responsive typography */}
        <h1 className="text-[28px] md:text-[40px] font-bold text-[#111827] font-nunito leading-[36px] md:leading-[48px] mb-6 md:mb-8">
          {t("incomeManagement")}
        </h1>

        {/* Month Selector - Mobile optimized */}
        {/* <div className="mb-6 md:mb-8">
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div> */}

        {/* Total Income - Mobile optimized */}
        <div className="bg-[#FFFFFF] rounded-[12px] p-4 md:p-6 mb-6 md:mb-8">
          <p className="text-[14px] md:text-[16px] text-[#6B7280] font-nunito mb-2">
            {t("totalSelectedMonthIncome")}
          </p>
          <p className="text-[24px] md:text-[32px] font-bold text-[#111827] font-nunito break-words">
            {loading ? (
              <span className="animate-pulse bg-[#E5E7EB] h-8 w-48 rounded inline-block"></span>
            ) : (
              formatCurrency(totalMonthIncome)
            )}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-[12px] p-4 mb-6 md:mb-8">
            <p className="text-[#DC2626] text-[14px] font-nunito">{error}</p>
          </div>
        )}

        {/* Income Transactions List - Mobile optimized */}
        <IncomeTransactionList
          incomes={incomes}
          loading={loading}
          onCreateIncome={() => setIsCreateModalOpen(true)}
          onEditIncome={handleEditIncome}
        />
      </div>

      {/* Modals */}
      <CreateIncomeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
        }}
        onIncomeCreated={handleIncomeCreated}
      />

      <EditIncomeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedIncome(null);
        }}
        onSuccess={() => {
          setIsEditModalOpen(false);
          setSelectedIncome(null);
        }}
        income={selectedIncome}
        onIncomeUpdated={handleIncomeUpdated}
      />
    </div>
  );
}
