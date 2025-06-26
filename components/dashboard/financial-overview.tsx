"use client";

import React from "react";
import { useFinancialOverview } from "@/hooks/use-financial-overview";
import FinancialSummaryCard from "./financial-summary-card";
import SpendingChart from "./spending-chart";
import TopSpendingBudgets from "./top-spending-budgets";

const FinancialOverview: React.FC = () => {
  const { data, loading, error } = useFinancialOverview();

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20" />
                  <div className="h-6 bg-gray-200 rounded w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
          <div className="bg-white p-6 rounded-lg animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-4 bg-gray-200 rounded w-16" />
                  </div>
                  <div className="h-2 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 text-sm">!</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-900 font-nunito">
              Error loading financial overview
            </h3>
            <p className="text-sm text-red-700 font-nunito">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Financial Summary Cards */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 font-nunito">
          Financial overview
        </h2>
        <FinancialSummaryCard
          totalBudget={data.totalBudget}
          totalExpenses={data.totalExpenses}
          totalIncome={data.totalIncome}
          remainingBudget={data.remainingBudget}
        />
      </div>

      {/* Charts and Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Chart */}
        <SpendingChart
          data={data.spendingByBudget}
          title="Monthly spending by budget"
        />

        {/* Top Spending Budgets */}
        <TopSpendingBudgets
          data={data.spendingByBudget}
          title="Budget utilization"
        />
      </div>

      {/* Additional Insights */}
      {data.remainingBudget < 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-red-600 text-sm font-bold">!</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900 font-nunito mb-2">
                Budget alert
              </h3>
              <p className="text-sm text-red-700 font-nunito">
                You&apos;ve exceeded your total budget by{" "}
                <span className="font-semibold">
                  ${Math.abs(data.remainingBudget).toLocaleString()}
                </span>
                . Consider reviewing your spending or adjusting your budget for
                next month.
              </p>
            </div>
          </div>
        </div>
      )}

      {data.remainingBudget > 0 &&
        data.remainingBudget < data.totalBudget * 0.2 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-600 text-sm font-bold">⚠</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 font-nunito mb-2">
                  Budget warning
                </h3>
                <p className="text-sm text-yellow-700 font-nunito">
                  You have only{" "}
                  <span className="font-semibold">
                    ${data.remainingBudget.toLocaleString()}
                  </span>{" "}
                  left in your budget. Consider reducing spending to stay within
                  your limits.
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default FinancialOverview;
