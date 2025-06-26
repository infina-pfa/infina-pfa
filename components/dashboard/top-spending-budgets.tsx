"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface BudgetSpending {
  name: string;
  amount: number;
  budgetAmount: number;
  percentage: number;
  color: string;
}

interface TopSpendingBudgetsProps {
  data: BudgetSpending[];
  title?: string;
}

const TopSpendingBudgets: React.FC<TopSpendingBudgetsProps> = ({
  data,
  title = "Top spending budgets",
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!data || data.length === 0) {
    return (
      <Card className="p-6 bg-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 font-nunito">
            {title}
          </h3>
        </div>
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-500 font-nunito">No budget data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 font-nunito">
          {title}
        </h3>
      </div>

      <div className="space-y-4">
        {data.map((budget, index) => {
          const isOverBudget = budget.percentage > 100;
          const progressWidth = Math.min(budget.percentage, 100);

          return (
            <div key={index} className="space-y-2">
              {/* Budget header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: budget.color || "#0055FF" }}
                  />
                  <span className="text-sm font-medium text-gray-900 font-nunito">
                    {budget.name}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 font-nunito">
                    {formatCurrency(budget.amount)}
                  </p>
                  <p
                    className={`text-xs font-nunito ${
                      isOverBudget ? "text-red-600" : "text-gray-500"
                    }`}
                  >
                    {budget.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isOverBudget
                        ? "bg-red-500"
                        : budget.percentage > 80
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${progressWidth}%`,
                      backgroundColor:
                        !isOverBudget && budget.percentage <= 80
                          ? budget.color || "#0055FF"
                          : undefined,
                    }}
                  />
                </div>
                {isOverBudget && (
                  <div className="absolute right-0 top-0 h-2 w-1 bg-red-600 rounded-r-full" />
                )}
              </div>

              {/* Budget details */}
              <div className="flex justify-between text-xs text-gray-500 font-nunito">
                <span>Spent: {formatCurrency(budget.amount)}</span>
                <span>Budget: {formatCurrency(budget.budgetAmount)}</span>
              </div>

              {/* Over budget warning */}
              {isOverBudget && (
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                  <div className="w-1 h-1 bg-red-500 rounded-full" />
                  <span className="text-xs text-red-700 font-nunito">
                    Over budget by{" "}
                    {formatCurrency(budget.amount - budget.budgetAmount)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 font-nunito">
            Total spending
          </span>
          <span className="text-sm font-semibold text-gray-900 font-nunito">
            {formatCurrency(
              data.reduce((sum, budget) => sum + budget.amount, 0)
            )}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default TopSpendingBudgets;
