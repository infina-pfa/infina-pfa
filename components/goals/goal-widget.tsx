"use client";

import { useGoalManagementSWR } from "@/hooks/swr";
import { useAppTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/lib/utils";
import { GoalList, GoalTransactionList } from "./";

export function GoalWidget() {
  const { t } = useAppTranslation(["goals", "common"]);
  const { goals, loading } = useGoalManagementSWR();

  // Calculate summary data
  const totalCurrentAmount = goals.reduce(
    (sum, goal) => sum + goal.current_amount,
    0
  );

  // Get recent transactions from all goals (mock data for now)
  const recentTransactions = goals
    .flatMap((goal) => {
      // In a real implementation, this would come from the API
      // For now, we'll create mock transactions
      return Array.isArray(goal.transactions) ? goal.transactions : [];
    })
    .slice(0, 5);

  // Handle create goal
  const handleCreateGoal = () => {
    console.log("Opening create goal modal");
  };

  // Handle edit goal
  const handleEditGoal = (goalId: string) => {
    console.log("Opening edit goal modal for goal:", goalId);
  };

  // Handle delete goal
  const handleDeleteGoal = (goalId: string) => {
    console.log("Deleting goal:", goalId);
    // In a real implementation, this would call the delete function from the hook
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Title - Responsive typography */}
        <h1 className="text-[28px] md:text-[40px] font-bold text-[#111827] font-nunito leading-[36px] md:leading-[48px] mb-6 md:mb-8">
          {t("goalsList")}
        </h1>

        {/* Total Goals Amount - Mobile optimized */}
        <div className="bg-[#FFFFFF] rounded-[12px] p-4 md:p-6 mb-6 md:mb-8">
          <p className="text-[14px] md:text-[16px] text-[#6B7280] font-nunito mb-2">
            {t("currentAmount")}
          </p>
          <p className="text-[24px] md:text-[32px] font-bold text-[#111827] font-nunito break-words">
            {loading ? (
              <span className="animate-pulse bg-[#E5E7EB] h-8 w-48 rounded inline-block"></span>
            ) : (
              formatCurrency(totalCurrentAmount)
            )}
          </p>
        </div>

        {/* Goals List Section */}
        <GoalList
          goals={goals}
          onCreateGoal={handleCreateGoal}
          onEditGoal={handleEditGoal}
          onDeleteGoal={handleDeleteGoal}
          loading={loading}
        />

        {/* Recent Transactions Section */}
        <div className="bg-[#FFFFFF] rounded-[12px] p-4 md:p-6">
          <GoalTransactionList
            transactions={recentTransactions}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
