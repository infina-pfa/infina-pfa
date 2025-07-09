"use client";

import { useState } from "react";

import { useAppTranslation } from "@/hooks/use-translation";
import { Income } from "@/lib/types/income.types";
import { formatCurrency } from "@/lib/utils";

// Import simplified components
import { IncomeTransactionList } from "./income-transaction-list";
import { CreateIncomeModal } from "./create-income-modal";
import { EditIncomeModal } from "./edit-income-modal";
import { MonthSelector } from "./month-selector";

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
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);

  // Mock data for selected month
  const mockIncomes: Income[] = [
    {
      id: "1",
      user_id: "user-1",
      name: "Software Engineer Salary",
      amount: 8000000,
      type: "income",
      description: "Salary",
      recurring: 30,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      user_id: "user-1",
      name: "Freelance Project",
      amount: 2500000,
      type: "income",
      description: "Freelance",
      recurring: 0,
      created_at: "2024-01-15T00:00:00Z",
      updated_at: "2024-01-15T00:00:00Z",
    },
    {
      id: "3",
      user_id: "user-1",
      name: "Investment Returns",
      amount: 1200000,
      type: "income",
      description: "Investment",
      recurring: 30,
      created_at: "2024-01-20T00:00:00Z",
      updated_at: "2024-01-20T00:00:00Z",
    },
  ];

  // Calculate total for selected month
  const totalMonthIncome = mockIncomes.reduce(
    (sum, income) => sum + income.amount,
    0
  );

  // Handle edit income
  const handleEditIncome = (income: Income) => {
    setSelectedIncome(income);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Title - Responsive typography */}
        <h1 className="text-[28px] md:text-[40px] font-bold text-[#111827] font-nunito leading-[36px] md:leading-[48px] mb-6 md:mb-8">
          {t("incomeManagement")}
        </h1>

        {/* Month Selector - Mobile optimized */}
        <div className="mb-6 md:mb-8">
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>

        {/* Total Income - Mobile optimized */}
        <div className="bg-[#FFFFFF] rounded-[12px] p-4 md:p-6 mb-6 md:mb-8">
          <p className="text-[14px] md:text-[16px] text-[#6B7280] font-nunito mb-2">
            {t("totalSelectedMonthIncome")}
          </p>
          <p className="text-[24px] md:text-[32px] font-bold text-[#111827] font-nunito break-words">
            {formatCurrency(totalMonthIncome)}
          </p>
        </div>

        {/* Income Transactions List - Mobile optimized */}
        <IncomeTransactionList
          incomes={mockIncomes}
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
        onIncomeCreated={onIncomeCreated}
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
        onIncomeUpdated={onIncomeUpdated}
      />
    </div>
  );
}
