"use client";

import { useState, useEffect } from "react";
import { OnboardingComponent, ComponentResponse } from "@/lib/types/onboarding.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { CheckCircle, AlertTriangle, Star, Home, Zap, TrendingUp, Calculator, Info } from "lucide-react";

interface BudgetAllocationToolProps {
  component: OnboardingComponent;
  onResponse: (response: ComponentResponse) => Promise<void>;
}

interface AllocationData {
  emergencyFund: number;
  livingExpenses: number;
  freeToSpend: number;
}

export default function BudgetAllocationTool({ 
  component, 
  onResponse 
}: BudgetAllocationToolProps) {
  const { t } = useAppTranslation(["onboarding", "budgeting", "common"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(!!component.response?.allocation);

  // Get income from component context (should be passed from previous steps)
  const monthlyIncome = component.context?.monthlyIncome || 10000000; // Default 10M VND for demo
  const emergencyFundTarget = component.context?.emergencyFundTarget || monthlyIncome * 3;
  const monthlyTargetSavings = component.context?.monthlyTargetSavings || monthlyIncome * 0.25;

  // Initialize allocation state
  const [allocation, setAllocation] = useState<AllocationData>(() => {
    if (component.response?.allocation) {
      return component.response.allocation;
    }
    // Default allocation based on PYF target
    const emergencyFundPercentage = (monthlyTargetSavings / monthlyIncome) * 100;
    const remainingPercentage = 100 - emergencyFundPercentage;
    return {
      emergencyFund: emergencyFundPercentage,
      livingExpenses: remainingPercentage * 0.7, // 70% of remaining
      freeToSpend: remainingPercentage * 0.3, // 30% of remaining
    };
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Calculate monetary values
  const calculateMonetaryValue = (percentage: number) => {
    return (monthlyIncome * percentage) / 100;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return Math.round(value * 10) / 10;
  };

  // Validate allocation
  const validateAllocation = (allocationData: AllocationData): string[] => {
    const errors: string[] = [];
    const total = allocationData.emergencyFund + allocationData.livingExpenses + allocationData.freeToSpend;
    
    // Check total is 100%
    if (Math.abs(total - 100) > 0.1) {
      errors.push(t("totalMustBe100Percent", { 
        ns: "budgeting", 
        defaultValue: "Total allocation must equal 100%" 
      }));
    }

    // Check Free to Spend rule (≤ 2x Emergency Fund)
    const emergencyFundAmount = calculateMonetaryValue(allocationData.emergencyFund);
    const freeToSpendAmount = calculateMonetaryValue(allocationData.freeToSpend);
    
    if (freeToSpendAmount > emergencyFundAmount * 2) {
      errors.push(t("freeToSpendRule", { 
        ns: "budgeting", 
        defaultValue: "Free to Spend cannot exceed 2x your Emergency Fund amount" 
      }));
    }

    // Check minimum emergency fund (at least 10%)
    if (allocationData.emergencyFund < 10) {
      errors.push(t("minimumEmergencyFund", { 
        ns: "budgeting", 
        defaultValue: "Emergency Fund should be at least 10% of your income" 
      }));
    }

    return errors;
  };

  // Update allocation and validate (with Emergency Fund lock)
  const updateAllocation = (category: keyof AllocationData, value: number) => {
    // Emergency Fund is locked - cannot be changed
    if (category === 'emergencyFund') {
      return;
    }
    
    const newAllocation = { ...allocation, [category]: value };
    
    // Auto-adjust the other non-emergency category to maintain 100%
    const emergencyFundPercentage = allocation.emergencyFund;
    const remainingForOthers = 100 - emergencyFundPercentage;
    
    if (category === 'livingExpenses') {
      // Adjust freeToSpend to maintain 100%
      newAllocation.freeToSpend = remainingForOthers - value;
    } else if (category === 'freeToSpend') {
      // Adjust livingExpenses to maintain 100%
      newAllocation.livingExpenses = remainingForOthers - value;
    }
    
    // Ensure values are within valid range
    newAllocation.livingExpenses = Math.max(0, Math.min(remainingForOthers, newAllocation.livingExpenses));
    newAllocation.freeToSpend = Math.max(0, Math.min(remainingForOthers, newAllocation.freeToSpend));
    
    setAllocation(newAllocation);
    setValidationErrors(validateAllocation(newAllocation));
  };

  // Handle percentage input change
  const handlePercentageChange = (category: keyof AllocationData, value: string) => {
    // Emergency Fund is locked - cannot be changed
    if (category === 'emergencyFund') {
      return;
    }
    
    const numValue = parseFloat(value) || 0;
    const clampedValue = Math.max(0, Math.min(100, numValue));
    
    // Check if the value would exceed the available remaining percentage
    const emergencyFundPercentage = allocation.emergencyFund;
    const remainingForOthers = 100 - emergencyFundPercentage;
    const finalValue = Math.min(clampedValue, remainingForOthers);
    
    updateAllocation(category, finalValue);
  };

  // Auto-adjust allocation to maintain 100% (Emergency Fund locked)
  const autoAdjustAllocation = (changedCategory: keyof AllocationData, newValue: number) => {
    // Emergency Fund is locked - no auto-adjustment available
    if (changedCategory === 'emergencyFund') {
      return;
    }
    
    const emergencyFundPercentage = allocation.emergencyFund;
    const remainingForOthers = 100 - emergencyFundPercentage;
    const otherCategory = changedCategory === 'livingExpenses' ? 'freeToSpend' : 'livingExpenses';
    const otherValue = remainingForOthers - newValue;
    
    if (otherValue >= 0) {
      const newAllocation = { 
        ...allocation, 
        [changedCategory]: newValue,
        [otherCategory]: otherValue
      };
      
      setAllocation(newAllocation);
      setValidationErrors(validateAllocation(newAllocation));
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (isSubmitting || isCompleted) return;

    const errors = validateAllocation(allocation);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      
      const monetaryValues = {
        emergencyFund: calculateMonetaryValue(allocation.emergencyFund),
        livingExpenses: calculateMonetaryValue(allocation.livingExpenses),
        freeToSpend: calculateMonetaryValue(allocation.freeToSpend),
      };

      await onResponse({
        allocation,
        monthlyIncome,
        monetaryValues,
        completedAt: new Date(),
        userMessage: t("budgetAllocationUserMessage", { 
          ns: "onboarding", 
          defaultValue: `I've allocated my monthly budget: Emergency Fund ${formatPercentage(allocation.emergencyFund)}% (${formatCurrency(monetaryValues.emergencyFund)}), Living Expenses ${formatPercentage(allocation.livingExpenses)}% (${formatCurrency(monetaryValues.livingExpenses)}), Free to Spend ${formatPercentage(allocation.freeToSpend)}% (${formatCurrency(monetaryValues.freeToSpend)}). I understand this priority-based allocation and I'm ready to proceed.` 
        }),
        allocationSummary: {
          total: formatCurrency(monthlyIncome),
          categories: [
            {
              name: t("emergencyFund", { ns: "budgeting", defaultValue: "Emergency Fund" }),
              percentage: formatPercentage(allocation.emergencyFund),
              amount: formatCurrency(monetaryValues.emergencyFund),
              priority: 1,
              locked: true
            },
            {
              name: t("livingExpenses", { ns: "budgeting", defaultValue: "Living Expenses" }),
              percentage: formatPercentage(allocation.livingExpenses),
              amount: formatCurrency(monetaryValues.livingExpenses),
              priority: 2,
              locked: false
            },
            {
              name: t("freeToSpend", { ns: "budgeting", defaultValue: "Free to Spend" }),
              percentage: formatPercentage(allocation.freeToSpend),
              amount: formatCurrency(monetaryValues.freeToSpend),
              priority: 3,
              locked: false
            }
          ]
        }
      });
      setIsCompleted(true);
    } catch (error) {
      console.error("Error submitting budget allocation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        defaultValue: "Your financial safety net - highest priority" 
      }),
    },
    {
      id: "livingExpenses",
      title: t("livingExpenses", { ns: "budgeting", defaultValue: "Living Expenses" }),
      subtitle: t("livingExpensesDescription", { ns: "budgeting", defaultValue: "Chi phí sinh hoạt + Kế hoạch tương lai" }),
      priority: 2,
      icon: Home,
      color: "#2ECC71",
      backgroundColor: "#E8F8F0",
      key: "livingExpenses" as keyof AllocationData,
      description: t("livingExpensesAllocationDescription", { 
        ns: "budgeting", 
        defaultValue: "Housing, food, transport, and planned expenses" 
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
        defaultValue: "Entertainment, shopping, and discretionary spending" 
      }),
    }
  ];

  const totalPercentage = allocation.emergencyFund + allocation.livingExpenses + allocation.freeToSpend;
  const isValid = validationErrors.length === 0 && Math.abs(totalPercentage - 100) < 0.1;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-[#111827] font-nunito">
          {t("budgetAllocationTitle", { 
            ns: "onboarding", 
            defaultValue: "Allocate Your Monthly Budget" 
          })}
        </h3>
        <p className="text-sm text-[#6B7280]">
          {t("budgetAllocationSubtitle", { 
            ns: "onboarding", 
            defaultValue: "Distribute your income across the 3 priority categories" 
          })}
        </p>
      </div>

      {/* Income Display */}
      <div className="bg-[#F6F7F9] rounded-xl p-4 border border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-[#0055FF]" />
            <span className="font-semibold text-[#111827] font-nunito">
              {t("monthlyIncome", { ns: "budgeting", defaultValue: "Monthly Income" })}
            </span>
          </div>
          <span className="text-lg font-bold text-[#0055FF]">
            {formatCurrency(monthlyIncome)}
          </span>
        </div>
      </div>

      {/* Allocation Progress */}
      <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-[#111827] font-nunito">
            {t("allocationProgress", { ns: "budgeting", defaultValue: "Allocation Progress" })}
          </span>
          <span className={`text-sm font-semibold ${
            Math.abs(totalPercentage - 100) < 0.1 ? "text-[#2ECC71]" : "text-[#FF9800]"
          }`}>
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
      <div className="space-y-4">
        <h4 className="font-semibold text-[#111827] font-nunito">
          {t("categoryAllocation", { ns: "budgeting", defaultValue: "Category Allocation" })}
        </h4>
        
        <div className="space-y-3">
          {budgetCategories.map((category) => {
            const IconComponent = category.icon;
            const currentValue = allocation[category.key];
            const monetaryValue = calculateMonetaryValue(currentValue);
            
            return (
              <div
                key={category.id}
                className="p-4 bg-white rounded-xl border border-[#E5E7EB]"
              >
                <div className="flex items-start space-x-3">
                  {/* Icon and Priority */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: category.backgroundColor }}
                      >
                        <IconComponent 
                          className="w-6 h-6" 
                          style={{ color: category.color }}
                        />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#0055FF] text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {category.priority}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-semibold text-[#111827] font-nunito">
                        {category.title}
                      </h5>
                      <span className="text-sm font-semibold text-[#6B7280]">
                        {formatPercentage(currentValue)}%
                      </span>
                    </div>
                    
                    <p className="text-sm text-[#6B7280] mb-3">
                      {category.description}
                    </p>

                    {/* Percentage Input */}
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formatPercentage(currentValue)}
                          onChange={(e) => handlePercentageChange(category.key, e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0055FF] focus:border-transparent ${
                            category.key === 'emergencyFund' 
                              ? 'border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] cursor-not-allowed' 
                              : 'border-[#D1D5DB] bg-white text-[#111827]'
                          }`}
                          placeholder="0.0"
                          disabled={isCompleted || category.key === 'emergencyFund'}
                          readOnly={category.key === 'emergencyFund'}
                        />
                        {category.key === 'emergencyFund' && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <div className="w-4 h-4 bg-[#6B7280] rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-[#6B7280]">%</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => autoAdjustAllocation(category.key, currentValue)}
                        disabled={isCompleted || category.key === 'emergencyFund'}
                        className="text-xs"
                      >
                        {t("autoAdjust", { ns: "budgeting", defaultValue: "Auto" })}
                      </Button>
                    </div>
                    
                    {/* Emergency Fund Lock Notice */}
                    {category.key === 'emergencyFund' && (
                      <div className="flex items-center space-x-2 text-xs text-[#6B7280] mb-2">
                        <Info className="w-3 h-3" />
                        <span>
                          {t("emergencyFundLocked", { 
                            ns: "budgeting", 
                            defaultValue: "Locked - confirmed in previous step" 
                          })}
                        </span>
                      </div>
                    )}

                    {/* Monetary Value */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#6B7280]">
                        {t("monthlyAmount", { ns: "budgeting", defaultValue: "Monthly Amount" })}
                      </span>
                      <span className="font-semibold" style={{ color: category.color }}>
                        {formatCurrency(monetaryValue)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-[#EF4444] font-nunito mb-2">
                {t("validationErrors", { ns: "common", defaultValue: "Please fix the following:" })}
              </h4>
              <ul className="space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm text-[#EF4444]">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-[#E8F1FF] rounded-xl p-4 border border-[#B3D4FF]">
        <div className="flex items-start space-x-2">
          <Info className="w-5 h-5 text-[#0055FF] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-[#111827] font-nunito mb-2">
              {t("allocationTips", { ns: "budgeting", defaultValue: "Allocation Tips" })}
            </h4>
            <ul className="space-y-1 text-sm text-[#4B5563]">
              <li>• {t("tip1", { ns: "budgeting", defaultValue: "Emergency Fund should be at least 10% of your income" })}</li>
              <li>• {t("tip2", { ns: "budgeting", defaultValue: "Free to Spend cannot exceed 2x your Emergency Fund amount" })}</li>
              <li>• {t("tip3", { ns: "budgeting", defaultValue: "Living Expenses should cover all your essential needs" })}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      {!isCompleted && (
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="w-full bg-[#0055FF] hover:bg-[#0044DD] text-white font-nunito disabled:bg-[#9CA3AF] disabled:cursor-not-allowed"
        >
          {isSubmitting 
            ? t("submitting", { ns: "common", defaultValue: "Submitting..." })
            : t("confirmAllocation", { ns: "budgeting", defaultValue: "Confirm Budget Allocation" })
          }
        </Button>
      )}

      {/* Completion Status */}
      {isCompleted && (
        <div className="flex items-center justify-center space-x-2 text-[#2ECC71] text-sm font-semibold">
          <CheckCircle className="w-4 h-4" />
          <span>
            {t("budgetAllocationCompleted", { 
              ns: "onboarding", 
              defaultValue: "Budget allocation completed!" 
            })}
          </span>
        </div>
      )}
    </div>
  );
}