"use client";

import { useState } from "react";
import {
  OnboardingComponent,
  ComponentResponse,
} from "@/lib/types/onboarding.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  PiggyBank,
  Home,
  Coffee,
  Target,
  DollarSign,
} from "lucide-react";

interface BudgetSummaryComponentProps {
  component: OnboardingComponent;
  onResponse: (response: ComponentResponse) => Promise<void>;
}

interface BudgetCategory {
  id: string;
  title: string;
  description: string;
  priority: number;
  amount: number;
}

interface BudgetSummaryContext {
  budgetSummary: {
    monthlyIncome: number;
    budgetCategories: BudgetCategory[];
  };
}

export default function BudgetSummaryComponent({
  component,
  onResponse,
}: BudgetSummaryComponentProps) {
  const { t } = useAppTranslation(["budgeting", "common"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(component.isCompleted);

  const context = component.context as BudgetSummaryContext;
  const { monthlyIncome, budgetCategories } = context.budgetSummary;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case "pyf":
        return PiggyBank;
      case "essential_expenses":
        return Home;
      case "free_to_spend":
        return Coffee;
      default:
        return Target;
    }
  };

  const getCategoryColor = (categoryId: string) => {
    switch (categoryId) {
      case "pyf":
        return "#2ECC71"; // Green for savings
      case "essential_expenses":
        return "#0055FF"; // Blue for essentials
      case "free_to_spend":
        return "#FF9800"; // Orange for free spending
      default:
        return "#6B7280";
    }
  };

  const getCategoryBackgroundColor = (categoryId: string) => {
    switch (categoryId) {
      case "pyf":
        return "#E8F8F0";
      case "essential_expenses":
        return "#E8F1FF";
      case "free_to_spend":
        return "#FFF4E6";
      default:
        return "#F3F4F6";
    }
  };

  const totalBudgetAmount = budgetCategories.reduce((total, category) => {
    return total + category.amount;
  }, 0);

  const handleConfirm = async () => {
    if (isSubmitting || isCompleted) return;

    try {
      setIsSubmitting(true);

      // Prepare budget allocation response
      const budgetAllocation = budgetCategories.reduce(
        (acc, category) => {
          const percentage = (category.amount / monthlyIncome) * 100;

          switch (category.id) {
            case "pyf":
              acc.emergencyFund = percentage;
              break;
            case "essential_expenses":
              acc.livingExpenses = percentage;
              break;
            case "free_to_spend":
              acc.freeToSpend = percentage;
              break;
          }
          return acc;
        },
        {
          emergencyFund: 0,
          livingExpenses: 0,
          freeToSpend: 0,
          totalPercentage: 100,
        }
      );

      const monetaryValues = budgetCategories.reduce(
        (acc, category) => {
          switch (category.id) {
            case "pyf":
              acc.emergencyFund = category.amount;
              break;
            case "essential_expenses":
              acc.livingExpenses = category.amount;
              break;
            case "free_to_spend":
              acc.freeToSpend = category.amount;
              break;
          }
          return acc;
        },
        { emergencyFund: 0, livingExpenses: 0, freeToSpend: 0 }
      );

      await onResponse({
        budgetAllocation,
        monetaryValues,
        monthlyIncome,
        completedAt: new Date(),
        userMessage: t("budgetSummaryConfirmed", {
          ns: "budgeting",
          defaultValue:
            "Tôi đã xem qua và đồng ý với bản tổng kết ngân sách này. Các danh mục đã được phân bổ hợp lý theo thu nhập hàng tháng của tôi.",
        }),
      });

      setIsCompleted(true);
    } catch (error) {
      console.error("Error confirming budget summary:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sort categories by priority
  const sortedCategories = [...budgetCategories].sort(
    (a, b) => a.priority - b.priority
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h3 className="text-base sm:text-lg font-semibold text-[#111827] font-nunito">
          {component.title}
        </h3>
        <p className="text-xs sm:text-sm text-[#6B7280]">
          {t("budgetSummarySubtitle", {
            ns: "budgeting",
            defaultValue:
              "Review your personalized budget allocation based on your income and goals",
          })}
        </p>
      </div>

      {/* Monthly Income Summary */}
      <div className="bg-[#F6F7F9] rounded-xl p-4 border border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#E8F1FF] rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#0055FF]" />
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">
                {t("monthlyIncome", {
                  ns: "budgeting",
                  defaultValue: "Monthly Income",
                })}
              </p>
              <p className="text-lg font-semibold text-[#111827] font-nunito">
                {formatCurrency(monthlyIncome)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#6B7280]">
              {t("totalAllocated", {
                ns: "budgeting",
                defaultValue: "Đã phân bổ",
              })}
            </p>
            <p className="text-lg font-semibold text-[#111827] font-nunito">
              {formatCurrency(totalBudgetAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Budget Categories */}
      <div className="space-y-3">
        <h4 className="font-semibold text-[#111827] font-nunito text-sm">
          {t("budgetBreakdown", {
            ns: "budgeting",
            defaultValue: "Budget Breakdown",
          })}
        </h4>

        {sortedCategories.map((category) => {
          const IconComponent = getCategoryIcon(category.id);
          const percentage = ((category.amount / monthlyIncome) * 100).toFixed(
            1
          );

          return (
            <div
              key={category.id}
              className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-sm"
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: getCategoryBackgroundColor(category.id),
                  }}
                >
                  <IconComponent
                    className="w-6 h-6"
                    style={{ color: getCategoryColor(category.id) }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-semibold text-[#111827] font-nunito text-sm">
                        {category.title}
                      </h5>
                      <p className="text-xs text-[#6B7280] mt-1">
                        {category.description}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-[#111827] font-nunito text-sm">
                        {formatCurrency(category.amount)}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {percentage}%{" "}
                        {t("ofIncome", {
                          ns: "common",
                          defaultValue: "of income",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Button */}
      {!isCompleted && (
        <Button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="w-full bg-[#0055FF] hover:bg-[#0044DD] text-white font-nunito disabled:bg-[#9CA3AF] disabled:cursor-not-allowed h-12 sm:h-10 min-h-[48px] sm:min-h-0 text-sm sm:text-base"
        >
          {isSubmitting
            ? t("submitting", { ns: "common", defaultValue: "Submitting..." })
            : t("confirmBudgetSummary", {
                ns: "budgeting",
                defaultValue: "Xác nhận ngân sách",
              })}
        </Button>
      )}

      {/* Completion Status */}
      {isCompleted && (
        <div className="flex items-center justify-center space-x-2 text-[#2ECC71] text-sm font-semibold">
          <CheckCircle className="w-4 h-4" />
          <span>
            {t("budgetSummaryCompleted", {
              ns: "budgeting",
              defaultValue: "Budget summary confirmed!",
            })}
          </span>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-[#6B7280]">
          {t("budgetSummaryNote", {
            ns: "budgeting",
            defaultValue:
              "You can adjust these allocations anytime in your budget settings.",
          })}
        </p>
      </div>
    </div>
  );
}
