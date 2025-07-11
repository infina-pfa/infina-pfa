"use client";

import { useState } from "react";
import { OnboardingComponent, ComponentResponse } from "@/lib/types/onboarding.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { Plus, X } from "lucide-react";

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

interface AdditionalExpense {
  name: string;
  amount: number;
}

export function ExpenseCategoriesComponent({
  component,
  onResponse,
}: ExpenseCategoriesComponentProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);
  
  const categories = (component.context.categories || []) as ExpenseCategory[];
  const allowAdditional = component.context.allowAdditional || false;
  
  const [expenseValues, setExpenseValues] = useState<Record<string, number>>({});
  const [additionalExpenses, setAdditionalExpenses] = useState<AdditionalExpense[]>([]);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState(false);
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

  const handleAddExpense = () => {
    if (!newExpenseName.trim() || newExpenseAmount <= 0) {
      return;
    }

    setAdditionalExpenses(prev => [
      ...prev,
      { name: newExpenseName.trim(), amount: newExpenseAmount }
    ]);
    
    setNewExpenseName("");
    setNewExpenseAmount(0);
    setShowAddForm(false);
  };

  const handleRemoveExpense = (index: number) => {
    setAdditionalExpenses(prev => prev.filter((_, i) => i !== index));
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
    const categoryTotal = Object.values(expenseValues).reduce((sum, value) => sum + (value || 0), 0);
    const additionalTotal = additionalExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return categoryTotal + additionalTotal;
  };

  const handleSubmit = async () => {
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const expenseBreakdown = {
        housing: expenseValues.housing || 0,
        food: expenseValues.food || 0,
        transportation: expenseValues.transportation || 0,
        other: expenseValues.other || 0,
        additional: additionalExpenses
      };

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

      {/* Additional Expenses */}
      {allowAdditional && (
        <div className="space-y-4">
          <div className="border-t border-[#E0E0E0] pt-4">
            <h4 className="font-medium text-[#111827] mb-3">
              {t("additionalExpenses")}
            </h4>
            
            {/* Existing Additional Expenses */}
            {additionalExpenses.length > 0 && (
              <div className="space-y-2 mb-4">
                {additionalExpenses.map((expense, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between bg-[#F0F2F5] p-3 rounded-lg"
                  >
                    <div className="flex-1">
                      <span className="text-sm font-medium text-[#111827]">
                        {expense.name}
                      </span>
                      <span className="text-sm text-[#6B7280] ml-2">
                        {expense.amount.toLocaleString()} VND
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveExpense(index)}
                      className="text-[#F44336] hover:text-[#F44336]/80 transition-colors p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Expense Form */}
            {showAddForm ? (
              <div className="space-y-3 bg-[#F6F7F9] p-4 rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">
                    {t("expenseName")}
                  </label>
                  <input
                    type="text"
                    value={newExpenseName}
                    onChange={(e) => setNewExpenseName(e.target.value)}
                    placeholder={t("expenseNamePlaceholder")}
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#0055FF] focus:border-transparent text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">
                    {t("amount")}
                  </label>
                  <MoneyInput
                    label=""
                    value={newExpenseAmount}
                    onChange={(value) => setNewExpenseAmount(parseInt(value) || 0)}
                    placeholder="Ví dụ: 50,000 VND"
                    className="w-full"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleAddExpense}
                    disabled={!newExpenseName.trim() || newExpenseAmount <= 0}
                    className="bg-[#0055FF] text-white px-4 py-2 text-sm"
                  >
                    {t("add")}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewExpenseName("");
                      setNewExpenseAmount(0);
                    }}
                    variant="outline"
                    className="px-4 py-2 text-sm"
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 text-[#0055FF] hover:text-[#0055FF]/80 transition-colors text-sm"
              >
                <Plus size={16} />
                <span>{t("addMoreExpenses")}</span>
              </button>
            )}
          </div>
        </div>
      )}

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