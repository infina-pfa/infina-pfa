"use client";

import useSWR from "swr";
import { budgetService } from "@/lib/services-v2/budget.service";
import { transactionService } from "@/lib/services-v2/transaction.service";
import { useAppTranslation } from "@/hooks/use-translation";

interface MonthlyAnalysisData {
  overspentAmount: number;
  isOverspent: boolean;
  overspentCategories: Array<{
    categoryName: string;
    overspentAmount: number;
    percentage: number;
    budgetAmount: number;
    spentAmount: number;
  }>;
  largestExpenses: Array<{
    description: string;
    amount: number;
    date: string;
    category: string;
    id: string;
  }>;
  previousMonthComparison: {
    spendingDifference: number;
    improvementAreas: string[];
    isImprovement: boolean;
  };
  totalBudget: number;
  totalSpent: number;
  monthYear: string;
}

interface UseMonthlyBudgetAnalysisSWRReturn {
  data: MonthlyAnalysisData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMonthlyBudgetAnalysisSWR(): UseMonthlyBudgetAnalysisSWRReturn {
  const { t } = useAppTranslation(["common"]);

  // Get current month and year, and previous month
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const previousDate = new Date(currentYear, currentMonth - 2); // -2 because month is 0-based
  const previousMonth = previousDate.getMonth() + 1;
  const previousYear = previousDate.getFullYear();

  const { data, error, isLoading, mutate } = useSWR(
    ["monthly-budget-analysis", currentMonth, currentYear],
    async () => {
      // Fetch current month budgets with spending
      const currentBudgetsResponse = await budgetService.getAllWithSpending(
        { month: currentMonth, year: currentYear },
        t
      );

      if (currentBudgetsResponse.error) {
        throw new Error(currentBudgetsResponse.error);
      }

      // Fetch previous month budgets for comparison
      const previousBudgetsResponse = await budgetService.getAllWithSpending(
        { month: previousMonth, year: previousYear },
        t
      );

      // Fetch recent transactions for largest expenses
      const transactionsResponse =
        await transactionService.getRecentTransactions(1, t);

      const currentBudgets = currentBudgetsResponse.budgets || [];
      const recentTransactions = transactionsResponse.transactions || [];

      // Calculate totals
      const totalBudget = currentBudgetsResponse.totalBudget || 0;
      const totalSpent = currentBudgetsResponse.totalSpent || 0;
      const previousTotalSpent = previousBudgetsResponse.totalSpent || 0;

      // Check if overspent overall
      const isOverspent = totalSpent > totalBudget;
      const overspentAmount = isOverspent ? totalSpent - totalBudget : 0;

      // Find overspent categories
      const overspentCategories = currentBudgets
        .filter((budget) => budget.spent > budget.amount)
        .map((budget) => ({
          categoryName: budget.name,
          overspentAmount: budget.spent - budget.amount,
          percentage:
            budget.amount > 0
              ? ((budget.spent - budget.amount) / budget.amount) * 100
              : 0,
          budgetAmount: budget.amount,
          spentAmount: budget.spent,
        }))
        .sort((a, b) => b.overspentAmount - a.overspentAmount);

      // Get top 5 largest expenses (assuming outcome type represents expenses)
      const largestExpenses = recentTransactions
        .filter((transaction) => transaction.type === "outcome")
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)
        .map((transaction) => ({
          description: transaction.name,
          amount: transaction.amount,
          date: transaction.created_at,
          category: transaction.budgetName || "Uncategorized",
          id: transaction.id,
        }));

      // Previous month comparison
      const spendingDifference = totalSpent - previousTotalSpent;
      const isImprovement = spendingDifference < 0; // Spending less is improvement

      // Suggest improvement areas based on overspent categories
      const improvementAreas = overspentCategories
        .slice(0, 3)
        .map((category) => category.categoryName);

      // Format month/year
      const monthYear = currentDate.toLocaleDateString("vi-VN", {
        month: "long",
        year: "numeric",
      });

      return {
        overspentAmount,
        isOverspent,
        overspentCategories,
        largestExpenses,
        previousMonthComparison: {
          spendingDifference,
          improvementAreas,
          isImprovement,
        },
        totalBudget,
        totalSpent,
        monthYear,
      };
    },
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
      dedupingInterval: 30000,
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
