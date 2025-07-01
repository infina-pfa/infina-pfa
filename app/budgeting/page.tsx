"use client";

import { AppLayout } from "@/components/ui/app-layout";
import { SpendingOverview } from "@/components/budgeting/spending-overview";
import { BudgetCategoriesList } from "@/components/budgeting/budget-categories-list";
import { RecentExpensesList } from "@/components/budgeting/recent-expenses-list";

// Mock data for the spending overview
const mockData = {
  totalSpent: 4000000,
  totalBudget: 20000000,
};

export default function BudgetingPage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F9FAFB]">
        <main className="pb-8">
          <SpendingOverview
            totalSpent={mockData.totalSpent}
            totalBudget={mockData.totalBudget}
          />

          <div className="mt-8">
            <BudgetCategoriesList />
          </div>

          <div className="mt-8">
            <RecentExpensesList />
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
