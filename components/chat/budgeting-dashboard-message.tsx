"use client";

import { useBudgets } from "@/hooks/swr/budget/use-budget-operations";
import { useAppTranslation } from "@/hooks/use-translation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatVND } from "@/lib/validation/input-validation";
import { BUDGET_ICONS } from "@/lib/utils/budget-constants";
import { useMemo } from "react";

import {
  TrendingUp,
  AlertTriangle,
  Plus,
  BarChart3,
  Calendar,
  Wallet,
} from "lucide-react";

interface BudgetingDashboardMessageProps {
  onSendMessage?: (message: string) => void;
}

export function BudgetingDashboardMessage({
  onSendMessage,
}: BudgetingDashboardMessageProps) {
  const { t } = useAppTranslation(["budgeting", "common"]);
  
  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  // Use the budget hook for current month
  const { budgets, isLoading: loading, isError: error } = useBudgets(currentMonth, currentYear);
  
  // Transform budget data to dashboard format
  const data = useMemo(() => {
    if (!budgets || budgets.length === 0) {
      return null;
    }
    
    // Calculate totals
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    
    // Calculate daily average
    const currentDay = currentDate.getDate();
    const dailyAverage = currentDay > 0 ? totalSpent / currentDay : 0;
    
    // Generate weekly trend (mock data)
    const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
      const baseAmount = dailyAverage * (i + 1);
      const variation = Math.random() * 0.2 - 0.1;
      return Math.max(0, baseAmount * (1 + variation));
    });
    
    // Transform budgets to dashboard format
    const monthlyBudgets = budgets.map((budget) => ({
      categoryId: budget.id,
      categoryName: budget.name,
      limit: budget.amount,
      spent: budget.spent,
      remaining: budget.amount - budget.spent,
      warningThreshold: budget.amount * 0.8,
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
  }, [budgets, currentDate]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 space-y-4 max-w-lg">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
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
        <div className="space-y-4">
          <Wallet className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">
            {t("dashboardNoBudgets")}
          </h3>
          <p className="text-gray-500">{t("dashboardCreateFirst")}</p>
          <Button
            className="bg-[#0055FF] hover:bg-[#0044CC] text-white"
            onClick={() =>
              onSendMessage && onSendMessage("I want to create my first budget")
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("createBudget")}
          </Button>
        </div>
      </div>
    );
  }

  const formatMonthYear = () => {
    const now = new Date();
    return now.toLocaleDateString("vi-VN", {
      month: "long",
      year: "numeric",
    });
  };

  const getOverallStatus = () => {
    if (data.isOverBudget) {
      return {
        color: "#F44336",
        bgColor: "#FFF5F5",
        icon: AlertTriangle,
        message: t("overBudgetWarning", {
          amount: formatVND(data.overBudgetAmount),
        }),
      };
    }
    const budgetUsage = (data.totalSpent / data.totalBudget) * 100;
    if (budgetUsage > 80) {
      return {
        color: "#FFC107",
        bgColor: "#FFFBF0",
        icon: AlertTriangle,
        message: t("budgetWarning", { percentage: Math.round(budgetUsage) }),
      };
    }
    return {
      color: "#2ECC71",
      bgColor: "#F0FDF4",
      icon: TrendingUp,
      message: t("budgetOnTrack"),
    };
  };

  const status = getOverallStatus();
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-lg p-6 space-y-6 max-w-lg">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {t("budgetingDashboardTitle")}
        </h3>
        <p className="text-sm text-gray-600 flex items-center justify-center">
          <Calendar className="h-4 w-4 mr-1" />
          {formatMonthYear()}
        </p>
      </div>

      {/* Overall Status */}
      <div
        className="p-4 rounded-lg flex items-center space-x-3"
        style={{ backgroundColor: status.bgColor }}
      >
        <StatusIcon className="h-5 w-5" style={{ color: status.color }} />
        <p className="text-sm font-medium" style={{ color: status.color }}>
          {status.message}
        </p>
      </div>

      {/* Spending Overview */}
      <div className="bg-[#F0F2F5] rounded-lg p-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm text-gray-600">{t("totalSpent")}</span>
          <span className="text-sm text-gray-600">{t("totalBudget")}</span>
        </div>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-2xl font-bold text-gray-900">
            {formatVND(data.totalSpent)}
          </span>
          <span className="text-lg text-gray-600">
            / {formatVND(data.totalBudget)}
          </span>
        </div>

        <Progress
          value={Math.min((data.totalSpent / data.totalBudget) * 100, 100)}
          className="h-2 mb-2"
        />

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {t("dailyAverage")}: {formatVND(data.dailyAverage)}
          </span>
          <span>{Math.round((data.totalSpent / data.totalBudget) * 100)}%</span>
        </div>
      </div>

      {/* Budget Categories */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center">
          <BarChart3 className="h-4 w-4 mr-2" />
          {t("budgetCategories")}
        </h4>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {data.monthlyBudgets.map((budget) => {
            const iconInfo =
              BUDGET_ICONS.find((icon) => icon.name === budget.icon) ||
              BUDGET_ICONS[0];
            const IconComponent = iconInfo.icon;
            const percentage =
              budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
            const isWarning = budget.spent > budget.warningThreshold;
            const isOverLimit = budget.spent > budget.limit;

            return (
              <div
                key={budget.categoryId}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${budget.color}20` }}
                >
                  <IconComponent
                    className="w-4 h-4"
                    style={{ color: budget.color }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {budget.categoryName}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        isOverLimit
                          ? "text-red-600"
                          : isWarning
                          ? "text-amber-600"
                          : "text-gray-600"
                      }`}
                    >
                      {formatVND(budget.spent)} / {formatVND(budget.limit)}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        isOverLimit
                          ? "bg-red-500"
                          : isWarning
                          ? "bg-amber-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2 pt-4 border-t border-gray-100">
        <Button
          className="w-full bg-[#0055FF] hover:bg-[#0044CC] text-white"
          onClick={() =>
            onSendMessage && onSendMessage("I want to add a new expense")
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("addExpense")}
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onSendMessage && onSendMessage("Show me my budget analysis")
            }
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            {t("viewAnalysis")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onSendMessage &&
              onSendMessage("I want to create a new budget category")
            }
          >
            <Plus className="h-4 w-4 mr-1" />
            {t("addCategory")}
          </Button>
        </div>
      </div>
    </div>
  );
}
