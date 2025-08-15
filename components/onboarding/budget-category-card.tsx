"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";
import { AllocationData } from "@/hooks/budgeting/use-budget-allocation";

interface BudgetCategoryCardProps {
  category: {
    id: string;
    title: string;
    subtitle: string;
    priority: number;
    icon: React.ElementType;
    color: string;
    backgroundColor: string;
    key: keyof AllocationData;
    description: string;
  };
  currentValue: number;
  monetaryValue: number;
  onPercentageChange: (category: keyof AllocationData, value: string) => void;
  onAutoAdjust: (category: keyof AllocationData, value: number) => void;
  formatCurrency: (amount: number) => string;
  formatPercentage: (value: number) => string;
  isCompleted: boolean;
  isLocked?: boolean;
}

export const BudgetCategoryCard: React.FC<BudgetCategoryCardProps> = React.memo(
  ({
    category,
    currentValue,
    monetaryValue,
    onPercentageChange,
    onAutoAdjust,
    formatCurrency,
    formatPercentage,
    isCompleted,
    isLocked = false,
  }) => {
    const { t } = useAppTranslation(["budgeting"]);
    const IconComponent = category.icon;

    return (
      <div className="p-3 sm:p-4 bg-white rounded-xl border border-[#E5E7EB]">
        <div className="flex items-start space-x-3">
          {/* Icon and Priority */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: category.backgroundColor }}
              >
                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: category.color }} />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#0055FF] text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center">
                {category.priority}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h5 className="font-semibold text-[#111827] font-nunito text-sm sm:text-base">{category.title}</h5>
              <span className="text-xs sm:text-sm font-semibold text-[#6B7280]">
                {formatPercentage(currentValue)}%
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#6B7280] mb-2 sm:mb-3">{category.description}</p>

            {/* Percentage Input */}
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex-1 relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formatPercentage(currentValue)}
                  onChange={(e) => onPercentageChange(category.key, e.target.value)}
                  className={`w-full px-3 py-3 sm:py-2 h-12 sm:h-auto min-h-[48px] sm:min-h-0 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0055FF] focus:border-transparent ${
                    isLocked
                      ? "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] cursor-not-allowed"
                      : "border-[#D1D5DB] bg-white text-[#111827]"
                  }`}
                  placeholder="0.0"
                  disabled={isCompleted || isLocked}
                  readOnly={isLocked}
                />
                {isLocked && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 bg-[#6B7280] rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-xs sm:text-sm text-[#6B7280]">%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAutoAdjust(category.key, currentValue)}
                disabled={isCompleted || isLocked}
                className="text-xs h-12 sm:h-auto min-h-[48px] sm:min-h-0"
              >
                {t("autoAdjust", { ns: "budgeting", defaultValue: "Auto" })}
              </Button>
            </div>

            {/* Emergency Fund Lock Notice */}
            {isLocked && (
              <div className="flex items-center space-x-2 text-[10px] sm:text-xs text-[#6B7280] mb-2">
                <Info className="w-3 h-3" />
                <span>
                  {t("emergencyFundLocked", {
                    ns: "budgeting",
                    defaultValue: "Locked - confirmed in previous step",
                  })}
                </span>
              </div>
            )}

            {/* Monetary Value */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-[#6B7280]">
                {t("monthlyAmount", { ns: "budgeting", defaultValue: "Monthly Amount" })}
              </span>
              <span className="font-semibold text-sm sm:text-base" style={{ color: category.color }}>
                {formatCurrency(monetaryValue)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

BudgetCategoryCard.displayName = "BudgetCategoryCard";