"use client";

import useSWR from "swr";
import { budgetService } from "@/lib/services/budget.service";
import { useAppTranslation } from "@/hooks/use-translation";

interface BudgetingDashboardData {
  monthlyBudgets: Array<{
    categoryId: string;
    categoryName: string;
    limit: number;
    spent: number;
    remaining: number;
    warningThreshold: number;
    color: string;
    icon: string;
  }>;
  totalSpent: number;
  totalBudget: number;
  dailyAverage: number;
  weeklyTrend: number[];
  isOverBudget: boolean;
  overBudgetAmount: number;
}

interface UseBudgetingDashboardSWRReturn {
  data: BudgetingDashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBudgetingDashboardSWR(): UseBudgetingDashboardSWRReturn {
  const { t } = useAppTranslation(["common"]);

  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const { data, error, isLoading, mutate } = useSWR(
    ["budgeting-dashboard", currentMonth, currentYear],
    async () => {
      // Fetch budgets with spending data for current month
      const budgetsResponse = await budgetService.getAllWithSpending(
        { month: currentMonth, year: currentYear },
        t
      );
      
      if (budgetsResponse.error) {
        throw new Error(budgetsResponse.error);
      }

      const budgets = budgetsResponse.budgets || [];
      
      // Calculate totals - getAllWithSpending returns totalBudget and totalSpent
      const totalBudget = budgetsResponse.totalBudget || 0;
      const totalSpent = budgetsResponse.totalSpent || 0;
      
      // Calculate daily average (assuming current day of month)
      const currentDay = currentDate.getDate();
      const dailyAverage = currentDay > 0 ? totalSpent / currentDay : 0;
      
      // Generate weekly trend (mock data for now - in real app, this would come from historical data)
      const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
        const baseAmount = dailyAverage * (i + 1);
        const variation = Math.random() * 0.2 - 0.1; // ±10% variation
        return Math.max(0, baseAmount * (1 + variation));
      });

      // Transform budgets to dashboard format
      const monthlyBudgets = budgets.map(budget => ({
        categoryId: budget.id,
        categoryName: budget.name,
        limit: budget.amount,
        spent: budget.spent,
        remaining: budget.remaining,
        warningThreshold: budget.amount * 0.8, // 80% threshold
        color: budget.color || "#0055FF",
        icon: budget.icon || "wallet",
      }));

      const isOverBudget = totalSpent > totalBudget;
      const overBudgetAmount = isOverBudget ? totalSpent - totalBudget : 0;

      return {
        monthlyBudgets,
        totalSpent,
        totalBudget,
        dailyAverage,
        weeklyTrend,
        isOverBudget,
        overBudgetAmount,
      };
    },
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 10000,
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