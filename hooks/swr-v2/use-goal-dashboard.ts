"use client";

import useSWR from "swr";
import { goalService } from "@/lib/services-v2/goal.service";
import { userContextService } from "@/lib/services-v2/user-context.service";
import { useAppTranslation } from "@/hooks/use-translation";

interface GoalDashboardData {
  currentAmount: number;
  targetAmount: number;
  progressPercentage: number;
  projectedCompletionDate: string;
  monthlySavingsRate: number;
  remainingAmount: number;
  estimatedMonthsToComplete: number;
  emergencyFundGoal?: {
    id: string;
    title: string;
    current_amount: number;
    target_amount: number | null;
    due_date: string | null;
  } | null;
}

interface UseGoalDashboardSWRReturn {
  data: GoalDashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGoalDashboardSWR(): UseGoalDashboardSWRReturn {
  const { t } = useAppTranslation(["common"]);

  const { data, error, isLoading, mutate } = useSWR(
    "goal-dashboard",
    async () => {
      try {
        // Get current date for monthly calculations
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        // Fetch all required data in parallel
        const [goalsResponse, financialOverview] = await Promise.all([
          goalService.getAllWithTransactions({}, t),
          userContextService
            .getFinancialOverview(currentMonth, currentYear, t)
            .catch(() => null),
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
            currentAmount: 0,
            targetAmount: 0,
            progressPercentage: 0,
            projectedCompletionDate: "",
            monthlySavingsRate: 0,
            remainingAmount: 0,
            estimatedMonthsToComplete: 0,
            emergencyFundGoal: null,
          };
        }

        const currentAmount = emergencyFundGoal.current_amount || 0;
        const targetAmount = emergencyFundGoal.target_amount || 0;
        const remainingAmount = Math.max(0, targetAmount - currentAmount);
        const progressPercentage =
          targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

        // Calculate monthly savings rate intelligently
        let monthlySavingsRate = 0;
        let estimatedMonthsToComplete = 0;

        if (
          emergencyFundGoal.due_date &&
          targetAmount > 0 &&
          remainingAmount > 0
        ) {
          // If there's a due date, calculate based on that
          const dueDate = new Date(emergencyFundGoal.due_date);
          const monthsUntilDue = Math.max(
            1,
            (dueDate.getFullYear() - currentDate.getFullYear()) * 12 +
              (dueDate.getMonth() - currentDate.getMonth())
          );
          monthlySavingsRate = remainingAmount / monthsUntilDue;
          estimatedMonthsToComplete = monthsUntilDue;
        } else if (
          financialOverview?.overview?.totalIncome &&
          financialOverview?.overview?.totalExpense
        ) {
          // Calculate based on user's actual income and expenses
          const monthlyDisposableIncome =
            financialOverview.overview.totalIncome -
            financialOverview.overview.totalExpense;
          const conservativeSavingsRate = Math.max(
            0,
            monthlyDisposableIncome * 0.2
          ); // 20% of disposable income

          if (conservativeSavingsRate > 0 && remainingAmount > 0) {
            monthlySavingsRate = conservativeSavingsRate;
            estimatedMonthsToComplete = Math.ceil(
              remainingAmount / conservativeSavingsRate
            );
          } else {
            // Fallback to a conservative estimate
            monthlySavingsRate = Math.min(500000, targetAmount * 0.05); // 5% of target or 500k VND
            estimatedMonthsToComplete =
              monthlySavingsRate > 0
                ? Math.ceil(remainingAmount / monthlySavingsRate)
                : 36;
          }
        } else {
          // Last resort fallback
          monthlySavingsRate = Math.min(500000, targetAmount * 0.05);
          estimatedMonthsToComplete =
            monthlySavingsRate > 0
              ? Math.ceil(remainingAmount / monthlySavingsRate)
              : 36;
        }

        // Calculate projected completion date
        const projectedDate = new Date(currentDate);
        projectedDate.setMonth(
          projectedDate.getMonth() + estimatedMonthsToComplete
        );
        const projectedCompletionDate =
          remainingAmount > 0 ? projectedDate.toISOString() : "";

        return {
          currentAmount,
          targetAmount,
          progressPercentage: Math.round(progressPercentage * 10) / 10, // Round to 1 decimal
          projectedCompletionDate,
          monthlySavingsRate,
          remainingAmount,
          estimatedMonthsToComplete,
          emergencyFundGoal: {
            id: emergencyFundGoal.id,
            title: emergencyFundGoal.title,
            current_amount: emergencyFundGoal.current_amount,
            target_amount: emergencyFundGoal.target_amount,
            due_date: emergencyFundGoal.due_date,
          },
        };
      } catch (error) {
        console.error("Goal dashboard calculation error:", error);
        throw error;
      }
    },
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 10000,
      onError: (error) => {
        console.error("SWR Goal Dashboard Error:", error);
      },
    }
  );

  return {
    data: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch: async () => {
      await mutate();
    },
  };
}
