"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Star, Home, Zap, Calculator, Info } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";
import { BudgetCategoryCard } from "./budget-category-card";
import { AllocationData } from "@/hooks/budgeting/use-budget-allocation";

interface BudgetAllocationFormProps {
  monthlyIncome: number;
  allocation: AllocationData;
  validationErrors: string[];
  totalPercentage: number;
  isValid: boolean;
  isSubmitting: boolean;
  isCompleted: boolean;
  budgetingStyle?: "goal_focused" | "detail_tracker";
  expenseBreakdown?: Record<string, number>;
  onPercentageChange: (category: keyof AllocationData, value: string) => void;
  onAutoAdjust: (category: keyof AllocationData, value: number) => void;
  onSubmit: () => void;
  formatCurrency: (amount: number) => string;
  formatPercentage: (value: number) => string;
  calculateMonetaryValue: (percentage: number) => number;
}

export const BudgetAllocationForm: React.FC<BudgetAllocationFormProps> = ({
  monthlyIncome,
  allocation,
  validationErrors,
  totalPercentage,
  isValid,
  isSubmitting,
  isCompleted,
  budgetingStyle,
  expenseBreakdown,
  onPercentageChange,
  onAutoAdjust,
  onSubmit,
  formatCurrency,
  formatPercentage,
  calculateMonetaryValue,
}) => {
  const { t } = useAppTranslation(["onboarding", "budgeting", "common"]);

  const budgetCategories = [
    {
      id: "emergencyFund",
      title: t("emergencyFund", { ns: "budgeting", defaultValue: "Emergency Fund" }),
      subtitle: t("emergencyFundDescription", { ns: "budgeting", defaultValue: "Quỹ dự phòng (PYF)" }),
      priority: 1,
      icon: Star,
      color: "#0055FF",
      backgroundColor: "#E8F1FF",
      key: "emergencyFund" as keyof AllocationData,
      description: t("emergencyFundAllocationDescription", {
        ns: "budgeting",
        defaultValue: "Your financial safety net - highest priority",
      }),
    },
    {
      id: "livingExpenses",
      title: t("livingExpenses", { ns: "budgeting", defaultValue: "Living Expenses" }),
      subtitle: t("livingExpensesDescription", {
        ns: "budgeting",
        defaultValue: "Chi phí sinh hoạt + Kế hoạch tương lai",
      }),
      priority: 2,
      icon: Home,
      color: "#2ECC71",
      backgroundColor: "#E8F8F0",
      key: "livingExpenses" as keyof AllocationData,
      description: t("livingExpensesAllocationDescription", {
        ns: "budgeting",
        defaultValue: "Housing, food, transport, and planned expenses",
      }),
    },
    {
      id: "freeToSpend",
      title: t("freeToSpend", { ns: "budgeting", defaultValue: "Free to Spend" }),
      subtitle: t("freeToSpendDescription", { ns: "budgeting", defaultValue: "Chi tiêu tự do" }),
      priority: 3,
      icon: Zap,
      color: "#FF9800",
      backgroundColor: "#FFF4E8",
      key: "freeToSpend" as keyof AllocationData,
      description: t("freeToSpendAllocationDescription", {
        ns: "budgeting",
        defaultValue: "Entertainment, shopping, and discretionary spending",
      }),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h3 className="text-base sm:text-lg font-semibold text-[#111827] font-nunito">
          {t("budgetAllocationTitle", {
            ns: "onboarding",
            defaultValue: "Allocate Your Monthly Budget",
          })}
        </h3>
        <p className="text-xs sm:text-sm text-[#6B7280]">
          {t("budgetAllocationSubtitle", {
            ns: "onboarding",
            defaultValue: "Distribute your income across the 3 priority categories",
          })}
        </p>
      </div>

      {/* Income Display */}
      <div className="bg-[#F6F7F9] rounded-xl p-3 sm:p-4 border border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-[#0055FF]" />
            <span className="font-semibold text-[#111827] font-nunito">
              {t("monthlyIncome", { ns: "budgeting", defaultValue: "Monthly Income" })}
            </span>
          </div>
          <span className="text-base sm:text-lg font-bold text-[#0055FF]">{formatCurrency(monthlyIncome)}</span>
        </div>

        {/* Show calculation method for transparency */}
        {budgetingStyle === "detail_tracker" && expenseBreakdown && Object.keys(expenseBreakdown).length > 0 && (
          <div className="mt-2 pt-2 border-t border-[#E5E7EB]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6B7280]">
                {t("calculationMethod", { ns: "budgeting", defaultValue: "Calculation Method" })}
              </span>
              <span className="text-[#4B5563] font-medium">
                {t("basedOnExpenseBreakdown", {
                  ns: "budgeting",
                  defaultValue: "Based on your expense breakdown",
                })}
              </span>
            </div>
          </div>
        )}

        {budgetingStyle === "goal_focused" && (
          <div className="mt-2 pt-2 border-t border-[#E5E7EB]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6B7280]">
                {t("calculationMethod", { ns: "budgeting", defaultValue: "Calculation Method" })}
              </span>
              <span className="text-[#4B5563] font-medium">
                {t("goalFocusedApproach", { ns: "budgeting", defaultValue: "Goal-focused approach" })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Allocation Progress */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-[#E5E7EB]">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-[#111827] font-nunito text-sm sm:text-base">
            {t("allocationProgress", { ns: "budgeting", defaultValue: "Allocation Progress" })}
          </span>
          <span
            className={`text-sm font-semibold ${
              Math.abs(totalPercentage - 100) < 0.1 ? "text-[#2ECC71]" : "text-[#FF9800]"
            }`}
          >
            {formatPercentage(totalPercentage)}%
          </span>
        </div>
        <div className="w-full bg-[#F3F4F6] rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              Math.abs(totalPercentage - 100) < 0.1 ? "bg-[#2ECC71]" : "bg-[#FF9800]"
            }`}
            style={{ width: `${Math.min(totalPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Category Allocation */}
      <div className="space-y-3 sm:space-y-4">
        <h4 className="font-semibold text-[#111827] font-nunito text-sm sm:text-base">
          {t("categoryAllocation", { ns: "budgeting", defaultValue: "Category Allocation" })}
        </h4>

        <div className="space-y-3">
          {budgetCategories.map((category) => {
            const currentValue = allocation[category.key];
            const monetaryValue = calculateMonetaryValue(currentValue);

            return (
              <BudgetCategoryCard
                key={category.id}
                category={category}
                currentValue={currentValue}
                monetaryValue={monetaryValue}
                onPercentageChange={onPercentageChange}
                onAutoAdjust={onAutoAdjust}
                formatCurrency={formatCurrency}
                formatPercentage={formatPercentage}
                isCompleted={isCompleted}
                isLocked={category.key === "emergencyFund"}
              />
            );
          })}
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-3 sm:p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-[#EF4444] font-nunito mb-2 text-sm sm:text-base">
                {t("validationErrors", { ns: "common", defaultValue: "Please fix the following:" })}
              </h4>
              <ul className="space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-xs sm:text-sm text-[#EF4444]">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-[#E8F1FF] rounded-xl p-3 sm:p-4 border border-[#B3D4FF]">
        <div className="flex items-start space-x-2">
          <Info className="w-5 h-5 text-[#0055FF] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-[#111827] font-nunito mb-2 text-sm sm:text-base">
              {t("allocationTips", { ns: "budgeting", defaultValue: "Allocation Tips" })}
            </h4>
            <ul className="space-y-1 text-xs sm:text-sm text-[#4B5563]">
              <li>
                •{" "}
                {t("tip1", {
                  ns: "budgeting",
                  defaultValue: "Emergency Fund should be at least 10% of your income",
                })}
              </li>
              <li>
                •{" "}
                {t("tip2", {
                  ns: "budgeting",
                  defaultValue: "Free to Spend cannot exceed 2x your Emergency Fund amount",
                })}
              </li>
              <li>
                •{" "}
                {t("tip3", {
                  ns: "budgeting",
                  defaultValue: "Living Expenses should cover all your essential needs",
                })}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      {!isCompleted && (
        <Button
          onClick={onSubmit}
          disabled={!isValid || isSubmitting}
          className="w-full bg-[#0055FF] hover:bg-[#0044DD] text-white font-nunito disabled:bg-[#9CA3AF] disabled:cursor-not-allowed h-12 sm:h-10 min-h-[48px] sm:min-h-0 text-sm sm:text-base"
        >
          {isSubmitting
            ? t("submitting", { ns: "common", defaultValue: "Submitting..." })
            : t("confirmAllocation", { ns: "budgeting", defaultValue: "Confirm Budget Allocation" })}
        </Button>
      )}

      {/* Completion Status */}
      {isCompleted && (
        <div className="flex items-center justify-center space-x-2 text-[#2ECC71] text-xs sm:text-sm font-semibold">
          <CheckCircle className="w-4 h-4" />
          <span>
            {t("budgetAllocationCompleted", {
              ns: "onboarding",
              defaultValue: "Budget allocation completed!",
            })}
          </span>
        </div>
      )}
    </div>
  );
};