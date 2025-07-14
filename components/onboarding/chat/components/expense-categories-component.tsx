"use client";

import { useState } from "react";
import { OnboardingComponent, ComponentResponse } from "@/lib/types/onboarding.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";

interface ExpenseCategoriesComponentProps {
  component: OnboardingComponent;
  onResponse: (response: ComponentResponse) => Promise<void>;
}

interface ExpenseCategory {
  id: string;
  name: string;
  placeholder: string;
  required: boolean;
}

export function ExpenseCategoriesComponent({
  component,
  onResponse,
}: ExpenseCategoriesComponentProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);
  
  const categories = (component.context.categories || []) as ExpenseCategory[];
  
  const [expenseValues, setExpenseValues] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleExpenseChange = (categoryId: string, value: number) => {
    setExpenseValues(prev => ({
      ...prev,
      [categoryId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[categoryId]) {
      setErrors(prev => ({
        ...prev,
        [categoryId]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    categories.forEach(category => {
      if (category.required && (!expenseValues[category.id] || expenseValues[category.id] <= 0)) {
        newErrors[category.id] = t("fieldRequired");
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getTotalExpenses = () => {
    return Object.values(expenseValues).reduce((sum, value) => sum + (value || 0), 0);
  };

  const handleSubmit = async () => {
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Build expense breakdown using actual category IDs from context
      const expenseBreakdown: Record<string, number> = {};
      
      // Map actual category IDs to their values
      categories.forEach((category) => {
        expenseBreakdown[category.id] = expenseValues[category.id] || 0;
      });

      await onResponse({
        expenseBreakdown,
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Error submitting expense categories:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-nunito">
      {/* Main Categories */}
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="space-y-2">
            <label className="text-sm font-medium text-[#111827]">
              {category.name}
              {category.required && <span className="text-[#F44336] ml-1">*</span>}
            </label>
            <MoneyInput
              label=""
              value={expenseValues[category.id] || 0}
              onChange={(value) => handleExpenseChange(category.id, parseInt(value) || 0)}
              placeholder={category.placeholder}
              className={`
                ${errors[category.id] 
                  ? 'border-[#F44336] focus:ring-[#F44336]' 
                  : 'border-[#E0E0E0] focus:ring-[#0055FF]'
                }
              `}
            />
            {errors[category.id] && (
              <p className="text-xs text-[#F44336]">{errors[category.id]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Total Summary */}
      {getTotalExpenses() > 0 && (
        <div className="bg-[#F0F2F5] p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium text-[#111827]">
              {t("totalMonthlyExpenses")}
            </span>
            <span className="font-bold text-[#0055FF] text-lg">
              {getTotalExpenses().toLocaleString()} VND
            </span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || getTotalExpenses() === 0}
          className={`
            px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200
            ${getTotalExpenses() > 0 && !isSubmitting
              ? 'bg-[#0055FF] text-white hover:bg-[#0055FF]/90' 
              : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? t("submitting") : t("continue")}
        </Button>
      </div>
    </div>
  );
} 