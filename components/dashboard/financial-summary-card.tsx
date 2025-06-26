"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Wallet, TrendingUp, Target, AlertCircle } from "lucide-react";

interface FinancialSummaryProps {
  totalBudget: number;
  totalExpenses: number;
  totalIncome: number;
  remainingBudget: number;
}

const FinancialSummaryCard: React.FC<FinancialSummaryProps> = ({
  totalBudget,
  totalExpenses,
  totalIncome,
  remainingBudget,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const spendingPercentage =
    totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;
  const isOverBudget = remainingBudget < 0;
  const budgetStatus = isOverBudget
    ? { color: "text-red-600", bgColor: "bg-red-50", icon: AlertCircle }
    : remainingBudget < totalBudget * 0.2
    ? { color: "text-yellow-600", bgColor: "bg-yellow-50", icon: Target }
    : { color: "text-green-600", bgColor: "bg-green-50", icon: Target };

  const StatusIcon = budgetStatus.icon;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Income */}
      <Card className="p-6 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-nunito">Total income</p>
            <p className="text-2xl font-bold text-gray-900 font-nunito">
              {formatCurrency(totalIncome)}
            </p>
          </div>
        </div>
      </Card>

      {/* Total Budget */}
      <Card className="p-6 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
            <Wallet className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-nunito">Total budget</p>
            <p className="text-2xl font-bold text-gray-900 font-nunito">
              {formatCurrency(totalBudget)}
            </p>
          </div>
        </div>
      </Card>

      {/* Total Expenses */}
      <Card className="p-6 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-nunito">Total expenses</p>
            <p className="text-2xl font-bold text-gray-900 font-nunito">
              {formatCurrency(totalExpenses)}
            </p>
            <p className="text-xs text-gray-500 font-nunito">
              {spendingPercentage.toFixed(1)}% of budget
            </p>
          </div>
        </div>
      </Card>

      {/* Remaining Budget */}
      <Card className="p-6 bg-white">
        <div className="flex items-center space-x-3">
          <div
            className={`w-12 h-12 ${budgetStatus.bgColor} rounded-full flex items-center justify-center`}
          >
            <StatusIcon className={`w-6 h-6 ${budgetStatus.color}`} />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-nunito">
              {isOverBudget ? "Over budget" : "Remaining budget"}
            </p>
            <p
              className={`text-2xl font-bold font-nunito ${
                isOverBudget ? "text-red-600" : "text-gray-900"
              }`}
            >
              {isOverBudget ? "-" : ""}
              {formatCurrency(Math.abs(remainingBudget))}
            </p>
            {!isOverBudget && (
              <p className="text-xs text-gray-500 font-nunito">
                Available to spend
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FinancialSummaryCard;
