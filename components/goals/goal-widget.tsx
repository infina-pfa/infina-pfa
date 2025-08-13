"use client";

import { useState } from "react";
import { useGoals, useDeleteGoal } from "@/hooks/swr/goal";
import { useAppTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { GoalResponseDto, GoalTransactionType } from "@/lib/types/goal.types";
import {
  GoalList,
  GoalTransactionList,
  CreateGoalModal,
  EditGoalModal,
} from "./";
import { DepositGoalModal } from "./deposit-goal-modal";
import { WithdrawGoalModal } from "./withdraw-goal-modal";

export function GoalWidget() {
  const { t } = useAppTranslation(["goals", "common"]);
  const toast = useToast();
  const { goals, isLoading, isError, mutate: refetch } = useGoals();
  const { deleteGoal, isDeleting } = useDeleteGoal();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalResponseDto | null>(null);

  // Calculate summary data
  const totalCurrentAmount = goals?.reduce(
    (sum, goal) => sum + goal.currentAmount,
    0
  ) || 0;

  // Get recent transactions from all goals and map to Transaction type
  const recentTransactions = goals
    ?.flatMap((goal) => {
      return Array.isArray(goal.transactions) ? goal.transactions.map(tx => ({
        id: tx.id,
        name: tx.name,
        description: tx.description,
        amount: tx.amount,
        type: tx.type === GoalTransactionType.GOAL_CONTRIBUTION ? "income" as const : "outcome" as const,
        recurring: tx.recurring,
        created_at: tx.createdAt,
        updated_at: tx.updatedAt,
        user_id: null,
      })) : [];
    })
    .slice(0, 5) || [];

  // Handle create goal
  const handleCreateGoal = () => {
    setIsCreateModalOpen(true);
  };

  // Handle edit goal
  const handleEditGoal = (goalId: string) => {
    const goal = goals?.find((g) => g.id === goalId);
    if (goal) {
      setSelectedGoal(goal);
      setIsEditModalOpen(true);
    }
  };

  // Handle deposit to goal
  const handleDepositGoal = (goalId: string) => {
    const goal = goals?.find((g) => g.id === goalId);
    if (goal) {
      setSelectedGoal(goal);
      setIsDepositModalOpen(true);
    }
  };

  // Handle withdraw from goal
  const handleWithdrawGoal = (goalId: string) => {
    const goal = goals?.find((g) => g.id === goalId);
    if (goal) {
      setSelectedGoal(goal);
      setIsWithdrawModalOpen(true);
    }
  };

  // Handle delete goal
  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      toast.success(t("goalDeleted", { ns: "goals" }));
      await refetch();
    } catch (err) {
      const error = err as { code?: string; message?: string };
      toast.error(
        t(error.code || "UNKNOWN_ERROR", {
          ns: "errors",
          defaultValue: error.message,
        })
      );
    }
  };

  // Handle modal close
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedGoal(null);
  };

  const handleCloseDepositModal = () => {
    setIsDepositModalOpen(false);
    setSelectedGoal(null);
  };

  const handleCloseWithdrawModal = () => {
    setIsWithdrawModalOpen(false);
    setSelectedGoal(null);
  };

  // Handle modal success
  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedGoal(null);
  };

  const handleDepositSuccess = () => {
    setIsDepositModalOpen(false);
    setSelectedGoal(null);
    // Trigger refetch to ensure UI updates with latest data
    refetch();
  };

  const handleWithdrawSuccess = () => {
    setIsWithdrawModalOpen(false);
    setSelectedGoal(null);
    // Trigger refetch to ensure UI updates with latest data
    refetch();
  };

  // Loading state
  if (isLoading || isDeleting) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0055FF] mx-auto mb-4"></div>
          <p className="text-[#6B7280] font-nunito">
            {t("loading", { ns: "common" })}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#F44336] font-nunito mb-4">
            {t("errorLoadingGoals", { ns: "goals" })}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-[#0055FF] text-white rounded-lg font-nunito hover:bg-[#0041CC]"
          >
            {t("retry", { ns: "common" })}
          </button>
        </div>
      </div>
    );
  }

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
            {formatCurrency(totalCurrentAmount)}
          </p>
        </div>

        {/* Goals List Section */}
        <GoalList
          goals={goals || []}
          onCreateGoal={handleCreateGoal}
          onEditGoal={handleEditGoal}
          onDepositGoal={handleDepositGoal}
          onWithdrawGoal={handleWithdrawGoal}
          onDeleteGoal={handleDeleteGoal}
          loading={false}
        />

        {/* Recent Transactions Section */}
        <div className="bg-[#FFFFFF] rounded-[12px] p-4 md:p-6">
          <GoalTransactionList
            transactions={recentTransactions}
            loading={false}
          />
        </div>
      </div>

      {/* Create Goal Modal */}
      <CreateGoalModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Goal Modal */}
      <EditGoalModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
        goal={selectedGoal}
      />

      {/* Deposit Goal Modal */}
      <DepositGoalModal
        isOpen={isDepositModalOpen}
        onClose={handleCloseDepositModal}
        onSuccess={handleDepositSuccess}
        goal={selectedGoal}
      />

      {/* Withdraw Goal Modal */}
      <WithdrawGoalModal
        isOpen={isWithdrawModalOpen}
        onClose={handleCloseWithdrawModal}
        onSuccess={handleWithdrawSuccess}
        goal={selectedGoal}
      />
    </div>
  );
}
