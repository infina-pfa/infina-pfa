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
  Circle,
  TrendingUp,
  Home,
  Zap,
  Star,
  AlertTriangle,
} from "lucide-react";

interface BudgetCategoryEducationProps {
  component: OnboardingComponent;
  onResponse: (response: ComponentResponse) => Promise<void>;
}

export default function BudgetCategoryEducation({
  component,
  onResponse,
}: BudgetCategoryEducationProps) {
  const { t } = useAppTranslation(["onboarding", "budgeting", "common"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [isCompleted, setIsCompleted] = useState(
    !!component.response?.understood
  );

  const budgetCategories = [
    {
      id: "emergency_fund",
      title: t("emergencyFund", {
        ns: "budgeting",
        defaultValue: "Emergency Fund",
      }),
      subtitle: t("emergencyFundDescription", {
        ns: "budgeting",
        defaultValue: "Quỹ dự phòng (PYF)",
      }),
      priority: 1,
      icon: Star,
      color: "#0055FF",
      backgroundColor: "#E8F1FF",
      description: t("emergencyFundPriorityDescription", {
        ns: "budgeting",
        defaultValue:
          "Your highest priority - this is your PYF amount for financial security",
      }),
      rule: t("emergencyFundRule", {
        ns: "budgeting",
        defaultValue: "Allocate first, never compromise this amount",
      }),
    },
    {
      id: "living_expenses",
      title: t("livingExpenses", {
        ns: "budgeting",
        defaultValue: "Living Expenses",
      }),
      subtitle: t("livingExpensesDescription", {
        ns: "budgeting",
        defaultValue: "Chi phí sinh hoạt + Kế hoạch tương lai",
      }),
      priority: 2,
      icon: Home,
      color: "#2ECC71",
      backgroundColor: "#E8F8F0",
      description: t("livingExpensesPriorityDescription", {
        ns: "budgeting",
        defaultValue: "Essential living costs and planned future expenses",
      }),
      rule: t("livingExpensesRule", {
        ns: "budgeting",
        defaultValue:
          "Allocate after emergency fund - covers necessities and plans",
      }),
    },
    {
      id: "free_to_spend",
      title: t("freeToSpend", {
        ns: "budgeting",
        defaultValue: "Free to Spend",
      }),
      subtitle: t("freeToSpendDescription", {
        ns: "budgeting",
        defaultValue: "Chi tiêu tự do",
      }),
      priority: 3,
      icon: Zap,
      color: "#FF9800",
      backgroundColor: "#FFF4E8",
      description: t("freeToSpendPriorityDescription", {
        ns: "budgeting",
        defaultValue:
          "Discretionary spending money for entertainment and wants",
      }),
      rule: t("freeToSpendRule", {
        ns: "budgeting",
        defaultValue: "Cannot exceed 2x your emergency fund amount",
      }),
    },
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleContinue = async () => {
    if (isSubmitting || isCompleted) return;

    try {
      setIsSubmitting(true);

      // Create meaningful response with learning context
      const response = {
        understood: true,
        selectedCategory,
        completedAt: new Date(),
        userMessage: t("budgetCategoryEducationUserMessage", {
          ns: "onboarding",
          defaultValue:
            "I understand the 3-category priority system: Emergency Fund (Priority 1), Living Expenses (Priority 2), and Free to Spend (Priority 3). I'm ready to allocate my budget using this priority system.",
        }),
        learningContext: {
          prioritySystem: "3-category priority system",
          categories: budgetCategories.map((cat) => ({
            name: cat.title,
            priority: cat.priority,
            rule: cat.rule,
          })),
          keyLearnings: [
            t("keyLearning1", {
              ns: "onboarding",
              defaultValue:
                "Always prioritize your emergency fund - it's your financial safety net",
            }),
            t("keyLearning2", {
              ns: "onboarding",
              defaultValue:
                "Cover essential living expenses before discretionary spending",
            }),
            t("keyLearning3", {
              ns: "onboarding",
              defaultValue:
                "Free spending should never exceed 2x your emergency fund",
            }),
          ],
        },
      };

      await onResponse(response);
      setIsCompleted(true);
    } catch (error) {
      console.error("Error submitting budget category education:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-[#111827] font-nunito">
          {t("budgetCategoryEducationTitle", {
            ns: "onboarding",
            defaultValue: "Understanding Your Budget Priorities",
          })}
        </h3>
        <p className="text-sm text-[#6B7280]">
          {t("budgetCategoryEducationSubtitle", {
            ns: "onboarding",
            defaultValue:
              "Learn the 3-category priority system to manage your money effectively",
          })}
        </p>
      </div>

      {/* Priority System Explanation */}
      <div className="bg-[#F6F7F9] rounded-xl p-4 border border-[#E5E7EB]">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="w-5 h-5 text-[#0055FF]" />
          <h4 className="font-semibold text-[#111827] font-nunito">
            {t("prioritySystemTitle", {
              ns: "onboarding",
              defaultValue: "Priority-Based Allocation System",
            })}
          </h4>
        </div>
        <p className="text-sm text-[#4B5563] leading-relaxed">
          {t("prioritySystemDescription", {
            ns: "onboarding",
            defaultValue:
              "We allocate your income in order of priority: Emergency Fund first, then Living Expenses, and finally Free to Spend money.",
          })}
        </p>
      </div>

      {/* Interactive Category Cards */}
      <div className="space-y-4">
        <h4 className="font-semibold text-[#111827] font-nunito">
          {t("budgetCategoriesTitle", {
            ns: "onboarding",
            defaultValue: "The 3 Budget Categories",
          })}
        </h4>

        <div className="space-y-3">
          {budgetCategories.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;

            return (
              <div
                key={category.id}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-[#0055FF] bg-[#F8FAFF]"
                    : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
                }`}
                onClick={() => handleCategorySelect(category.id)}
              >
                {/* Priority Badge */}
                <div className="absolute top-3 right-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-[#0055FF] text-white text-xs font-bold rounded-full">
                    {category.priority}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: category.backgroundColor }}
                  >
                    <IconComponent
                      className="w-6 h-6"
                      style={{ color: category.color }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-semibold text-[#111827] font-nunito">
                        {category.title}
                      </h5>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-[#0055FF]" />
                      )}
                    </div>
                    <p className="text-sm text-[#4B5563] mb-2">
                      {category.subtitle}
                    </p>
                    <p className="text-xs text-[#6B7280] mb-2">
                      {category.description}
                    </p>

                    {/* Rule */}
                    <div className="flex items-start space-x-2 p-2 bg-[#F9FAFB] rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-[#FF9800] flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-[#6B7280]">
                        <span className="font-semibold">
                          {t("rule", { ns: "common", defaultValue: "Rule" })}:
                        </span>{" "}
                        {category.rule}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Learning Points */}
      <div className="bg-[#E8F1FF] rounded-xl p-4 border border-[#B3D4FF]">
        <h4 className="font-semibold text-[#111827] font-nunito mb-3">
          {t("keyLearningTitle", {
            ns: "onboarding",
            defaultValue: "Key Learning Points",
          })}
        </h4>
        <ul className="space-y-2 text-sm text-[#4B5563]">
          <li className="flex items-start space-x-2">
            <Circle className="w-1.5 h-1.5 bg-[#0055FF] rounded-full flex-shrink-0 mt-2" />
            <span>
              {t("keyLearning1", {
                ns: "onboarding",
                defaultValue:
                  "Always prioritize your emergency fund - it's your financial safety net",
              })}
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <Circle className="w-1.5 h-1.5 bg-[#0055FF] rounded-full flex-shrink-0 mt-2" />
            <span>
              {t("keyLearning2", {
                ns: "onboarding",
                defaultValue:
                  "Cover essential living expenses before discretionary spending",
              })}
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <Circle className="w-1.5 h-1.5 bg-[#0055FF] rounded-full flex-shrink-0 mt-2" />
            <span>
              {t("keyLearning3", {
                ns: "onboarding",
                defaultValue:
                  "Free spending should never exceed 2x your emergency fund",
              })}
            </span>
          </li>
        </ul>
      </div>

      {/* Continue Button */}
      {!isCompleted && (
        <Button
          onClick={handleContinue}
          disabled={isSubmitting}
          className="w-full bg-[#0055FF] hover:bg-[#0044DD] text-white font-nunito"
        >
          {isSubmitting
            ? t("submitting", { ns: "common", defaultValue: "Submitting..." })
            : t("continueToAllocation", {
                ns: "onboarding",
                defaultValue: "Continue to Budget Allocation",
              })}
        </Button>
      )}

      {/* Completion Status */}
      {isCompleted && (
        <div className="flex items-center justify-center space-x-2 text-[#2ECC71] text-sm font-semibold">
          <CheckCircle className="w-4 h-4" />
          <span>
            {t("budgetCategoryEducationCompleted", {
              ns: "onboarding",
              defaultValue: "Budget categories understood!",
            })}
          </span>
        </div>
      )}
    </div>
  );
}
