"use client";

import { useBudgets } from "@/hooks/swr/budget/use-budget-operations";
import { useMonthlySpending } from "@/hooks/swr/budget/use-budget-spending";
import { useAppTranslation } from "@/hooks/use-translation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/validation/input-validation";
import { useMemo } from "react";

import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  ShoppingBag,
  PiggyBank,
} from "lucide-react";

interface MonthlyBudgetAnalysisMessageProps {
  onSendMessage?: (message: string) => void;
}

export function MonthlyBudgetAnalysisMessage({
  onSendMessage,
}: MonthlyBudgetAnalysisMessageProps) {
  const { t } = useAppTranslation(["budgeting", "common"]);
  
  // Get current and previous month dates
  const currentDate = useMemo(() => new Date(), []);
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  const previousDate = new Date(currentYear, currentMonth - 2);
  const previousMonth = previousDate.getMonth() + 1;
  const previousYear = previousDate.getFullYear();
  
  // Fetch current month budgets
  const { budgets: currentBudgets, isLoading: currentLoading, isError: currentError } = 
    useBudgets(currentMonth, currentYear);
  
  // Fetch previous month budgets for comparison
  const { budgets: previousBudgets, isLoading: previousLoading } = 
    useBudgets(previousMonth, previousYear);
  
  // Fetch spending transactions for current month
  const { spending: currentSpending, isLoading: spendingLoading } = 
    useMonthlySpending(currentMonth, currentYear);
  
  const loading = currentLoading || previousLoading || spendingLoading;
  const error = currentError;
  
  // Transform data into analysis format
  const data = useMemo(() => {
    if (!currentBudgets || currentBudgets.length === 0) {
      return null;
    }
    
    // Calculate totals
    const totalBudget = currentBudgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = currentBudgets.reduce((sum, b) => sum + b.spent, 0);
    
    // Previous month totals
    const previousTotalSpent = previousBudgets
      ? previousBudgets.reduce((sum, b) => sum + b.spent, 0)
      : 0;
    
    // Check if overspent
    const isOverspent = totalSpent > totalBudget;
    const overspentAmount = isOverspent ? totalSpent - totalBudget : 0;
    
    // Find overspent categories
    const overspentCategories = currentBudgets
      .filter(budget => budget.spent > budget.amount)
      .map(budget => ({
        categoryName: budget.name,
        overspentAmount: budget.spent - budget.amount,
        percentage: budget.amount > 0
          ? ((budget.spent - budget.amount) / budget.amount) * 100
          : 0,
        budgetAmount: budget.amount,
        spentAmount: budget.spent,
      }))
      .sort((a, b) => b.overspentAmount - a.overspentAmount);
    
    // Get largest expenses from spending transactions
    const largestExpenses = currentSpending
      ? currentSpending
          .filter(transaction => transaction.type === "budget_spending")
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5)
          .map(transaction => ({
            description: transaction.name,
            amount: transaction.amount,
            date: transaction.createdAt,
            category: transaction.budget?.name || "Uncategorized",
            id: transaction.id,
          }))
      : [];
    
    // Previous month comparison
    const spendingDifference = totalSpent - previousTotalSpent;
    const isImprovement = spendingDifference < 0;
    
    // Suggest improvement areas
    const improvementAreas = overspentCategories
      .slice(0, 3)
      .map(category => category.categoryName);
    
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
  }, [currentBudgets, previousBudgets, currentSpending, currentDate]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 space-y-4 max-w-lg">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 text-center max-w-lg">
        <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-2" />
        <p className="text-gray-500">{t("common:errorLoadingData")}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg p-6 text-center max-w-lg">
        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t("analysisNoData")}
        </h3>
        <p className="text-gray-500">{t("analysisCreateBudgets")}</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "short",
    });
  };

  const ComparisonIcon = data.previousMonthComparison.isImprovement
    ? TrendingDown
    : TrendingUp;
  const comparisonColor = data.previousMonthComparison.isImprovement
    ? "#2ECC71"
    : "#F44336";

  return (
    <div className="bg-white rounded-lg p-6 space-y-6 max-w-lg">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {t("monthlyAnalysisTitle")}
        </h3>
        <p className="text-sm text-gray-600 flex items-center justify-center">
          <Calendar className="h-4 w-4 mr-1" />
          {data.monthYear}
        </p>
      </div>

      {/* Overall Summary */}
      <div
        className={`p-4 rounded-lg ${
          data.isOverspent
            ? "bg-red-50 border border-red-200"
            : "bg-green-50 border border-green-200"
        }`}
      >
        <div className="flex items-center space-x-3">
          {data.isOverspent ? (
            <AlertTriangle className="h-6 w-6 text-red-500" />
          ) : (
            <Target className="h-6 w-6 text-green-500" />
          )}
          <div className="flex-1">
            <h4
              className={`font-semibold ${
                data.isOverspent ? "text-red-700" : "text-green-700"
              }`}
            >
              {data.isOverspent ? t("analysisOverspent") : t("analysisOnTrack")}
            </h4>
            <p
              className={`text-sm ${
                data.isOverspent ? "text-red-600" : "text-green-600"
              }`}
            >
              {data.isOverspent
                ? t("analysisOverspentAmount", {
                    amount: formatVND(data.overspentAmount),
                  })
                : t("analysisBudgetUsed", {
                    percentage: Math.round(
                      (data.totalSpent / data.totalBudget) * 100
                    ),
                  })}
            </p>
          </div>
        </div>
      </div>

      {/* Previous Month Comparison */}
      <div className="p-4 bg-[#F0F2F5] rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
          <ComparisonIcon
            className="h-4 w-4 mr-2"
            style={{ color: comparisonColor }}
          />
          {t("analysisPreviousMonth")}
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {t("analysisSpendingChange")}
          </span>
          <span
            className="text-sm font-medium"
            style={{ color: comparisonColor }}
          >
            {data.previousMonthComparison.spendingDifference > 0 ? "+" : ""}
            {formatVND(
              Math.abs(data.previousMonthComparison.spendingDifference)
            )}
          </span>
        </div>
      </div>

      {/* Overspent Categories */}
      {data.overspentCategories.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
            {t("analysisOverspentCategories")}
          </h4>
          <div className="space-y-2">
            {data.overspentCategories.slice(0, 3).map((category, index) => (
              <div
                key={index}
                className="p-3 bg-amber-50 rounded-lg border border-amber-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {category.categoryName}
                  </span>
                  <span className="text-sm font-medium text-amber-700">
                    +{formatVND(category.overspentAmount)}
                  </span>
                </div>
                <div className="text-xs text-amber-600">
                  {t("analysisOverspentBy", {
                    percentage: Math.round(category.percentage),
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Largest Expenses */}
      {data.largestExpenses.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center">
            <ShoppingBag className="h-4 w-4 mr-2 text-blue-500" />
            {t("analysisLargestExpenses")}
          </h4>
          <div className="space-y-2">
            {data.largestExpenses.slice(0, 3).map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {expense.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {expense.category} • {formatDate(expense.date)}
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-900 ml-2">
                  {formatVND(expense.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Suggestions */}
      {data.previousMonthComparison.improvementAreas.length > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
            <PiggyBank className="h-4 w-4 mr-2" />
            {t("analysisImprovementTips")}
          </h4>
          <ul className="space-y-1">
            {data.previousMonthComparison.improvementAreas.map(
              (area, index) => (
                <li key={index} className="text-sm text-blue-700">
                  • {t("analysisReduceSpending", { category: area })}
                </li>
              )
            )}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-4 border-t border-gray-100">
        <Button
          className="w-full bg-[#0055FF] hover:bg-[#0044CC] text-white"
          onClick={() =>
            onSendMessage &&
            onSendMessage("Help me create a budget plan for next month")
          }
        >
          <Target className="h-4 w-4 mr-2" />
          {t("analysisPlanNextMonth")}
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onSendMessage && onSendMessage("Show me my spending trends")
            }
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            {t("analysisViewTrends")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onSendMessage && onSendMessage("How can I save money next month?")
            }
          >
            <PiggyBank className="h-4 w-4 mr-1" />
            {t("analysisSavingTips")}
          </Button>
        </div>
      </div>
    </div>
  );
}
