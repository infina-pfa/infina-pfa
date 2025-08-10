"use client";

import { useBudgetManagementSWR } from "@/hooks/swr-v2";
import { useAppTranslation } from "@/hooks/use-translation";
import { BUDGET_ICONS } from "@/lib/utils/budget-constants";
import { formatCurrency } from "@/lib/utils";
import { ProgressBar } from "@/components/budgeting/progress-bar";
import {
  Calendar,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import { useMemo } from "react";

interface BudgetDetailMessageProps {
  onSendMessage?: (message: string) => void;
}

export function BudgetDetailMessage({
  onSendMessage,
}: BudgetDetailMessageProps) {
  const { t } = useAppTranslation(["budgeting", "common"]);

  // Get current month and year for filtering
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Memoize filter object
  const filter = useMemo(
    () => ({
      month: currentMonth,
      year: currentYear,
    }),
    [currentMonth, currentYear]
  );

  const { budgets, totalBudget, totalSpent, loading, error } =
    useBudgetManagementSWR(filter);

  const formatMonthYear = () => {
    return `Tháng ${currentMonth}/${currentYear}`;
  };

  const formatVND = (amount: number) => formatCurrency(amount);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 space-y-4 max-w-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 max-w-lg">
        <div className="text-center text-red-500">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm font-medium">
            {t("failedToLoadBudgets", { ns: "budgeting" })}
          </p>
        </div>
      </div>
    );
  }

  const remaining = totalBudget - totalSpent;
  const spendingPercentage =
    totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isOverBudget = totalSpent > totalBudget;

  const getOverallStatus = () => {
    if (isOverBudget) {
      return {
        color: "#F44336",
        bgColor: "#FFF5F5",
        icon: TrendingDown,
        message: `Đã vượt ngân sách ${formatVND(totalSpent - totalBudget)}`,
      };
    }
    if (spendingPercentage > 80) {
      return {
        color: "#FFC107",
        bgColor: "#FFFBF0",
        icon: AlertTriangle,
        message: `Đã chi ${Math.round(spendingPercentage)}% ngân sách`,
      };
    }
    return {
      color: "#2ECC71",
      bgColor: "#F0FDF4",
      icon: TrendingUp,
      message: "Ngân sách đang theo kế hoạch",
    };
  };

  const status = getOverallStatus();
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-lg p-6 space-y-6 max-w-lg">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          Chi tiết ngân sách
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

      {/* Budget Summary */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center">
          <BarChart3 className="h-4 w-4 mr-2" />
          Tổng quan chi tiêu
        </h4>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Đã chi:</span>
            <span className="font-semibold text-gray-900">
              {formatVND(totalSpent)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tổng ngân sách:</span>
            <span className="font-semibold text-gray-900">
              {formatVND(totalBudget)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Còn lại:</span>
            <span
              className={`font-semibold ${
                remaining >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatVND(remaining)}
            </span>
          </div>

          <ProgressBar
            value={Math.min(spendingPercentage, 100)}
            color={
              isOverBudget
                ? "#F44336"
                : spendingPercentage > 80
                ? "#FFC107"
                : "#0055FF"
            }
            className="h-3 mt-2"
          />
        </div>
      </div>

      {/* Budget Categories */}
      {budgets.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">
            Danh mục chi tiêu ({budgets.length})
          </h4>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {budgets.map((budget) => {
              const iconInfo =
                BUDGET_ICONS.find((icon) => icon.name === budget.icon) ||
                BUDGET_ICONS[0];
              const IconComponent = iconInfo.icon;
              const percentage =
                budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
              const isWarning = budget.spent > budget.amount * 0.8;
              const isOverLimit = budget.spent > budget.amount;

              return (
                <div
                  key={budget.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
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
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {budget.name}
                      </p>
                      <span
                        className={`text-xs font-medium ${
                          isOverLimit
                            ? "text-red-600"
                            : isWarning
                            ? "text-yellow-600"
                            : "text-gray-600"
                        }`}
                      >
                        {Math.round(percentage)}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                      <span>{formatVND(budget.spent)}</span>
                      <span>{formatVND(budget.amount)}</span>
                    </div>

                    <ProgressBar
                      value={Math.min(percentage, 100)}
                      color={
                        isOverLimit
                          ? "#F44336"
                          : isWarning
                          ? "#FFC107"
                          : budget.color
                      }
                      className="h-1.5"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => onSendMessage?.("Tạo ngân sách mới")}
          className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Tạo ngân sách
        </button>
        <button
          onClick={() => onSendMessage?.("Thêm chi tiêu mới")}
          className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Thêm chi tiêu
        </button>
      </div>
    </div>
  );
}
