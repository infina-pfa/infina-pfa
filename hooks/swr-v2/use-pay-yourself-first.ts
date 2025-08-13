"use client";

import useSWR from "swr";
import { goalService } from "@/lib/services-v2/goal.service";
import { userContextService } from "@/lib/services-v2/user-context.service";
import { useAppTranslation } from "@/hooks/use-translation";
import { useState } from "react";

interface PayYourselfFirstData {
  recommendedAmount: number;
  minRecommendedAmount: number;
  maxRecommendedAmount: number;
  userInput: number;
  status: "pending" | "completed" | "postponed";
  dueDate: string;
  emergencyFundGoal?: {
    id: string;
    title: string;
    current_amount: number;
    target_amount: number | null;
    due_date?: string | null;
  } | null;
  aiRecommendation: {
    reasoning: string;
    monthsToComplete: number;
    remainingAmount: number;
    monthlyRequiredAmount: number;
    userFinancialCapacity: number;
    confidenceLevel: "high" | "medium" | "low";
  };
}

interface UsePayYourselfFirstSWRReturn {
  data: PayYourselfFirstData | null;
  loading: boolean;
  error: string | null;
  updateAmount: (amount: number) => Promise<boolean>;
  confirmTransfer: () => Promise<boolean>;
  postponeTransfer: () => Promise<boolean>;
  isUpdating: boolean;
  refetch: () => Promise<void>;
}

export function usePayYourselfFirstSWR(): UsePayYourselfFirstSWRReturn {
  const { t } = useAppTranslation(["common", "goals"]);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(
    "pay-yourself-first",
    async () => {
      // Fetch both goals and financial context
      const [goalsResponse, financialResponse] = await Promise.all([
        goalService.getAllWithTransactions({}, t),
        userContextService.getFinancialOverview(undefined, undefined, t),
      ]);

      if (goalsResponse.error) {
        throw new Error(goalsResponse.error);
      }

      // Find emergency fund goal
      const emergencyFundGoal =
        goalsResponse.goals?.find(
          (goal) =>
            goal.title.toLowerCase().includes("emergency") ||
            goal.title.toLowerCase().includes("dự phòng") ||
            goal.title.toLowerCase().includes("khẩn cấp") ||
            goal.title.toLowerCase().includes("fund")
        ) ||
        goalsResponse.goals?.[0] ||
        null;

      if (!emergencyFundGoal) {
        return {
          recommendedAmount: 500000, // Default 500k VND
          minRecommendedAmount: 200000,
          maxRecommendedAmount: 1000000,
          userInput: 0,
          status: "pending" as const,
          dueDate: new Date().toISOString(),
          emergencyFundGoal: null,
          aiRecommendation: {
            reasoning: t("noGoalReasoning", { ns: "goals" }),
            monthsToComplete: 36,
            remainingAmount: 0,
            monthlyRequiredAmount: 500000,
            userFinancialCapacity: 500000,
            confidenceLevel: "low" as const,
          },
        };
      }

      // Calculate intelligent recommendations
      const currentAmount = emergencyFundGoal.current_amount || 0;
      const targetAmount = emergencyFundGoal.target_amount || 0;
      const remainingAmount = Math.max(0, targetAmount - currentAmount);

      // Calculate months to goal due date or default to 36 months
      let monthsToComplete = 36;
      if (emergencyFundGoal.due_date) {
        const dueDate = new Date(emergencyFundGoal.due_date);
        const currentDate = new Date();
        const monthsDiff =
          (dueDate.getFullYear() - currentDate.getFullYear()) * 12 +
          (dueDate.getMonth() - currentDate.getMonth());
        monthsToComplete = Math.max(1, monthsDiff);
      }

      // Calculate required monthly amount to reach goal
      const monthlyRequiredAmount =
        remainingAmount > 0 ? remainingAmount / monthsToComplete : 0;

      // Estimate user financial capacity from financial overview
      let userFinancialCapacity = 500000; // Default
      let confidenceLevel: "high" | "medium" | "low" = "low";

      if (financialResponse.overview && !financialResponse.error) {
        const monthlyIncome = financialResponse.overview.totalIncome || 0;
        const monthlyExpense = financialResponse.overview.totalExpense || 0;
        const monthlySurplus = monthlyIncome - monthlyExpense;

        // Conservative recommendation: 15-30% of surplus for emergency fund
        if (monthlySurplus > 0) {
          userFinancialCapacity = monthlySurplus * 0.25; // 25% of surplus
          confidenceLevel = "high";
        } else if (monthlyIncome > 0) {
          // If no surplus, recommend 5-10% of income
          userFinancialCapacity = monthlyIncome * 0.08; // 8% of income
          confidenceLevel = "medium";
        }
      }

      // AI recommendation logic
      let recommendedAmount: number;
      let reasoning: string;

      if (remainingAmount <= 0) {
        // Goal is already complete
        recommendedAmount = 0;
        reasoning = t("goalCompleteReasoning", { ns: "goals" });
      } else if (monthlyRequiredAmount <= userFinancialCapacity) {
        // User can afford the required amount
        recommendedAmount = Math.round(monthlyRequiredAmount);
        reasoning = t("onTrackReasoning", {
          amount: Math.round(monthlyRequiredAmount),
          months: monthsToComplete,
          ns: "goals",
        });
      } else if (userFinancialCapacity >= monthlyRequiredAmount * 0.5) {
        // User can afford at least 50% of required amount
        recommendedAmount = Math.round(userFinancialCapacity);
        const adjustedMonths = Math.ceil(
          remainingAmount / userFinancialCapacity
        );
        reasoning = t("stretchedButFeasibleReasoning", {
          amount: Math.round(userFinancialCapacity),
          extraMonths: adjustedMonths - monthsToComplete,
          ns: "goals",
        });
      } else {
        // User's capacity is too low for the timeline
        recommendedAmount = Math.round(userFinancialCapacity);
        reasoning = t("challengingTimelineReasoning", {
          amount: Math.round(userFinancialCapacity),
          ns: "goals",
        });
        confidenceLevel = "low";
      }

      // Set min/max recommendations
      const minRecommendedAmount = Math.round(recommendedAmount * 0.5);
      const maxRecommendedAmount = Math.round(
        Math.min(recommendedAmount * 2, userFinancialCapacity * 1.5)
      );

      return {
        recommendedAmount: Math.max(100000, recommendedAmount), // Minimum 100k VND
        minRecommendedAmount: Math.max(50000, minRecommendedAmount),
        maxRecommendedAmount: Math.max(200000, maxRecommendedAmount),
        userInput: 0,
        status: "pending" as const,
        dueDate: new Date().toISOString(),
        emergencyFundGoal: {
          id: emergencyFundGoal.id,
          title: emergencyFundGoal.title,
          current_amount: currentAmount,
          target_amount: targetAmount,
          due_date: emergencyFundGoal.due_date,
        },
        aiRecommendation: {
          reasoning,
          monthsToComplete,
          remainingAmount,
          monthlyRequiredAmount: Math.round(monthlyRequiredAmount),
          userFinancialCapacity: Math.round(userFinancialCapacity),
          confidenceLevel,
        },
      };
    },
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
      dedupingInterval: 15000,
    }
  );

  const updateAmount = async (amount: number): Promise<boolean> => {
    if (!data?.emergencyFundGoal) return false;

    setIsUpdating(true);
    try {
      const updateData = {
        current_amount: (data.emergencyFundGoal.current_amount || 0) + amount,
      };

      const response = await goalService.update(
        data.emergencyFundGoal.id,
        updateData,
        t
      );

      if (response.error) {
        throw new Error(response.error);
      }

      // Refresh the data
      await mutate();
      return true;
    } catch (error) {
      console.error("Error updating goal amount:", error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmTransfer = async (): Promise<boolean> => {
    if (!data?.userInput || data.userInput <= 0) return false;

    const success = await updateAmount(data.userInput);
    if (success) {
      // Trigger a refetch to get updated data
      await mutate();
    }
    return success;
  };

  const postponeTransfer = async (): Promise<boolean> => {
    if (!data) return false;

    // Status update is handled server-side, just trigger refetch
    await mutate();
    return true;
  };

  return {
    data: data || null,
    loading: isLoading,
    error: error?.message || null,
    updateAmount,
    confirmTransfer,
    postponeTransfer,
    isUpdating,
    refetch: async () => {
      await mutate();
    },
  };
}
