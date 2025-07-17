"use client";

import { useState } from "react";
import { OnboardingComponent, ComponentResponse } from "@/lib/types/onboarding.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { 
  Home, 
  Utensils, 
  Car, 
  ShoppingCart, 
  Zap, 
  Heart, 
  GraduationCap, 
  Gamepad2, 
  Plane, 
  MoreHorizontal,
  TrendingUp,
  Check,
  Loader2
} from "lucide-react";

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

// Helper function to get icon for category
const getCategoryIcon = (categoryName: string, categoryId: string) => {
  const name = categoryName.toLowerCase();
  const id = categoryId.toLowerCase();
  
  if (name.includes('nhà') || name.includes('thuê') || name.includes('house') || name.includes('rent') || id.includes('housing')) {
    return Home;
  }
  if (name.includes('ăn') || name.includes('thức ăn') || name.includes('food') || id.includes('food')) {
    return Utensils;
  }
  if (name.includes('xe') || name.includes('giao thông') || name.includes('transport') || id.includes('transport')) {
    return Car;
  }
  if (name.includes('mua sắm') || name.includes('shopping') || id.includes('shopping')) {
    return ShoppingCart;
  }
  if (name.includes('điện') || name.includes('nước') || name.includes('utility') || id.includes('utility')) {
    return Zap;
  }
  if (name.includes('sức khỏe') || name.includes('y tế') || name.includes('health') || id.includes('health')) {
    return Heart;
  }
  if (name.includes('học') || name.includes('giáo dục') || name.includes('education') || id.includes('education')) {
    return GraduationCap;
  }
  if (name.includes('giải trí') || name.includes('entertainment') || id.includes('entertainment')) {
    return Gamepad2;
  }
  if (name.includes('du lịch') || name.includes('travel') || id.includes('travel')) {
    return Plane;
  }
  
  return MoreHorizontal;
};

// Helper function to get color for category
const getCategoryColor = (categoryName: string, categoryId: string) => {
  const name = categoryName.toLowerCase();
  const id = categoryId.toLowerCase();
  
  if (name.includes('nhà') || name.includes('thuê') || id.includes('housing')) {
    return '#0055FF'; // Primary Blue
  }
  if (name.includes('ăn') || name.includes('thức ăn') || id.includes('food')) {
    return '#FF9800'; // Orange
  }
  if (name.includes('xe') || name.includes('giao thông') || id.includes('transport')) {
    return '#2ECC71'; // Green
  }
  if (name.includes('mua sắm') || id.includes('shopping')) {
    return '#FFC107'; // Yellow
  }
  if (name.includes('điện') || name.includes('nước') || id.includes('utility')) {
    return '#FFC107'; // Yellow
  }
  if (name.includes('sức khỏe') || name.includes('y tế') || id.includes('health')) {
    return '#2ECC71'; // Green
  }
  if (name.includes('học') || name.includes('giáo dục') || id.includes('education')) {
    return '#0055FF'; // Blue
  }
  if (name.includes('giải trí') || id.includes('entertainment')) {
    return '#F44336'; // Red
  }
  if (name.includes('du lịch') || id.includes('travel')) {
    return '#FF9800'; // Orange
  }
  
  return '#6B7280'; // Gray
};

export function ExpenseCategoriesComponent({
  component,
  onResponse,
}: ExpenseCategoriesComponentProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);
  
  const categories = (component.context.categories || []) as ExpenseCategory[];
  
  const [expenseValues, setExpenseValues] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedCategory, setFocusedCategory] = useState<string | null>(null);

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

  const getFilledCategoriesCount = () => {
    return Object.values(expenseValues).filter(value => value > 0).length;
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
    <div className="space-y-4 font-nunito max-w-md mx-auto">
      {/* Compact Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#0055FF] mb-2">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-base font-bold text-[#111827] leading-5">
          {t("expenseCategoriesTitle", { defaultValue: "Chi tiết chi phí hàng tháng" })}
        </h3>
        <p className="text-xs text-[#6B7280] leading-4">
          {t("expenseCategoriesDescription", { 
            defaultValue: "Nhập số tiền dự kiến cho từng danh mục" 
          })}
        </p>
      </div>

      {/* Compact Categories */}
      <div className="space-y-3">
        {categories.map((category) => {
          const IconComponent = getCategoryIcon(category.name, category.id);
          const categoryColor = getCategoryColor(category.name, category.id);
          const hasValue = expenseValues[category.id] > 0;
          const isFocused = focusedCategory === category.id;
          const hasError = errors[category.id];

          return (
            <div
              key={category.id}
              className={`
                relative transition-all duration-200
                ${isFocused ? 'transform scale-[1.01]' : ''}
              `}
            >
              {/* Compact Category Card */}
              <div
                className={`
                  bg-white rounded-xl p-3 transition-all duration-200
                  border border-[#E5E7EB] hover:border-[#0055FF]/30
                  ${isFocused ? 'border-[#0055FF] shadow-sm' : ''}
                  ${hasError ? 'border-[#F44336] bg-[#F44336]/5' : ''}
                  ${hasValue ? 'border-[#2ECC71] bg-[#2ECC71]/5' : ''}
                `}
              >
                {/* Compact Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${categoryColor}20` }}
                  >
                    <IconComponent
                      className="w-4 h-4"
                      style={{ color: categoryColor }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[#111827] leading-4">
                      {category.name}
                      {category.required && (
                        <span className="text-[#F44336] ml-1 text-xs">*</span>
                      )}
                    </h4>
                    {hasValue && (
                      <div className="flex items-center gap-1 mt-1">
                        <Check className="w-3 h-3 text-[#2ECC71]" />
                        <span className="text-xs text-[#2ECC71]">
                          {expenseValues[category.id].toLocaleString()} VNĐ
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Compact Money Input */}
                <MoneyInput
                  label=""
                  value={expenseValues[category.id] || 0}
                  onChange={(value) => handleExpenseChange(category.id, parseInt(value) || 0)}
                  onFocus={() => setFocusedCategory(category.id)}
                  onBlur={() => setFocusedCategory(null)}
                  placeholder={category.placeholder}
                  className={`
                    text-sm h-9 bg-[#F9FAFB] border-0 border-b rounded-lg px-3 py-2
                    ${hasError
                      ? 'border-b-[#F44336] focus:border-b-[#F44336]'
                      : hasValue
                      ? 'border-b-[#2ECC71] focus:border-b-[#2ECC71]'
                      : 'border-b-[#E5E7EB] focus:border-b-[#0055FF]'
                    }
                  `}
                />
                
                {hasError && (
                  <div className="flex items-center gap-1 text-xs text-[#F44336] mt-1">
                    <div className="w-3 h-3 rounded-full bg-[#F44336] flex items-center justify-center">
                      <span className="text-white text-[10px]">!</span>
                    </div>
                    {errors[category.id]}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Summary */}
      {getTotalExpenses() > 0 && (
        <div className="bg-[#0055FF] rounded-xl p-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-white" />
              <div>
                <h4 className="font-semibold text-sm">
                  {t("totalMonthlyExpenses", { defaultValue: "Tổng chi tiêu" })}
                </h4>
                <p className="text-xs text-white/80">
                  {getFilledCategoriesCount()}/{categories.length} danh mục
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-base font-bold">
                {getTotalExpenses().toLocaleString()} VNĐ
              </div>
            </div>
          </div>

          {/* Compact Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-1 mt-2">
            <div
              className="bg-white rounded-full h-1 transition-all duration-300"
              style={{
                width: `${Math.min((getFilledCategoriesCount() / categories.length) * 100, 100)}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Compact Submit Button */}
      <div className="flex justify-center pt-2">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || getTotalExpenses() === 0}
          className={`
            px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200
            ${getTotalExpenses() > 0 && !isSubmitting
              ? 'bg-[#0055FF] text-white hover:bg-[#0055FF]/90' 
              : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t("submitting", { defaultValue: "Đang xử lý..." })}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>{t("continue", { defaultValue: "Tiếp tục" })}</span>
              <TrendingUp className="w-4 h-4" />
            </div>
          )}
        </Button>
      </div>
    </div>
  );
} 