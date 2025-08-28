"use client";

import { useState } from "react";
import {
  OnboardingComponent,
  ComponentResponse,
} from "@/lib/types/onboarding.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
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
  Loader2,
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
  defaultValue?: number;
}

// Helper function to get icon for category
const getCategoryIcon = (categoryName: string, categoryId: string) => {
  const name = categoryName.toLowerCase();
  const id = categoryId.toLowerCase();

  if (
    name.includes("nhà") ||
    name.includes("thuê") ||
    name.includes("house") ||
    name.includes("rent") ||
    id.includes("housing")
  ) {
    return Home;
  }
  if (
    name.includes("ăn") ||
    name.includes("thức ăn") ||
    name.includes("food") ||
    id.includes("food")
  ) {
    return Utensils;
  }
  if (
    name.includes("xe") ||
    name.includes("giao thông") ||
    name.includes("transport") ||
    id.includes("transport")
  ) {
    return Car;
  }
  if (
    name.includes("mua sắm") ||
    name.includes("shopping") ||
    id.includes("shopping")
  ) {
    return ShoppingCart;
  }
  if (
    name.includes("điện") ||
    name.includes("nước") ||
    name.includes("utility") ||
    id.includes("utility")
  ) {
    return Zap;
  }
  if (
    name.includes("sức khỏe") ||
    name.includes("y tế") ||
    name.includes("health") ||
    id.includes("health")
  ) {
    return Heart;
  }
  if (
    name.includes("học") ||
    name.includes("giáo dục") ||
    name.includes("education") ||
    id.includes("education")
  ) {
    return GraduationCap;
  }
  if (
    name.includes("giải trí") ||
    name.includes("entertainment") ||
    id.includes("entertainment")
  ) {
    return Gamepad2;
  }
  if (
    name.includes("du lịch") ||
    name.includes("travel") ||
    id.includes("travel")
  ) {
    return Plane;
  }

  return MoreHorizontal;
};

// Helper function to get color for category
const getCategoryColor = (categoryName: string, categoryId: string) => {
  const name = categoryName.toLowerCase();
  const id = categoryId.toLowerCase();

  if (name.includes("nhà") || name.includes("thuê") || id.includes("housing")) {
    return "#0055FF"; // Primary Blue
  }
  if (name.includes("ăn") || name.includes("thức ăn") || id.includes("food")) {
    return "#FF9800"; // Orange
  }
  if (
    name.includes("xe") ||
    name.includes("giao thông") ||
    id.includes("transport")
  ) {
    return "#2ECC71"; // Green
  }
  if (name.includes("mua sắm") || id.includes("shopping")) {
    return "#FFC107"; // Yellow
  }
  if (
    name.includes("điện") ||
    name.includes("nước") ||
    id.includes("utility")
  ) {
    return "#FFC107"; // Yellow
  }
  if (
    name.includes("sức khỏe") ||
    name.includes("y tế") ||
    id.includes("health")
  ) {
    return "#2ECC71"; // Green
  }
  if (
    name.includes("học") ||
    name.includes("giáo dục") ||
    id.includes("education")
  ) {
    return "#0055FF"; // Blue
  }
  if (name.includes("giải trí") || id.includes("entertainment")) {
    return "#F44336"; // Red
  }
  if (name.includes("du lịch") || id.includes("travel")) {
    return "#FF9800"; // Orange
  }

  return "#6B7280"; // Gray
};

export function ExpenseCategoriesComponent({
  component,
  onResponse,
}: ExpenseCategoriesComponentProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);

  const categories = (component.context.categories || []) as ExpenseCategory[];

  // State management
  const [expenseValues, setExpenseValues] = useState<Record<string, number>>(
    () => {
      const initialValues: Record<string, number> = {};
      categories.forEach((category) => {
        if (category.defaultValue && category.defaultValue > 0) {
          initialValues[category.id] = category.defaultValue;
        }
      });
      return initialValues;
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleExpenseChange = (categoryId: string, value: string | number) => {
    // Parse the value if it's a string
    const numericValue =
      typeof value === "string"
        ? parseFloat(value.replace(/[^0-9.-]/g, "")) || 0
        : value;

    setExpenseValues((prev) => ({
      ...prev,
      [categoryId]: numericValue,
    }));

    // Clear error when user starts typing
    if (errors[categoryId] && numericValue > 0) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[categoryId];
        return newErrors;
      });
    }
  };

  const handleFieldBlur = (categoryId: string) => {
    setTouched((prev) => ({ ...prev, [categoryId]: true }));

    // Validate on blur
    const category = categories.find((c) => c.id === categoryId);
    if (
      category?.required &&
      (!expenseValues[categoryId] || expenseValues[categoryId] <= 0)
    ) {
      setErrors((prev) => ({
        ...prev,
        [categoryId]: t("fieldRequired", { ns: "common" }),
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};

    categories.forEach((category) => {
      newTouched[category.id] = true;
      if (
        category.required &&
        (!expenseValues[category.id] || expenseValues[category.id] <= 0)
      ) {
        newErrors[category.id] = t("fieldRequired", { ns: "common" });
      }
    });

    setErrors(newErrors);
    setTouched(newTouched);
    return Object.keys(newErrors).length === 0;
  };

  const getTotalExpenses = () => {
    return Object.values(expenseValues).reduce(
      (sum, value) => sum + (value || 0),
      0
    );
  };

  const getFilledCategoriesCount = () => {
    return Object.values(expenseValues).filter((value) => value > 0).length;
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
        budgetingStyle: "detail_tracker", // Mark this as detail tracker style
        completedAt: new Date(),
        userMessage: t("expenseCategoriesUserMessage", {
          ns: "onboarding",
          categoriesCount: categories.length,
          totalExpenses: getTotalExpenses().toLocaleString(),
          categories: categories
            .map(
              (cat) =>
                `${cat.name}: ${(
                  expenseValues[cat.id] || 0
                ).toLocaleString()} VNĐ`
            )
            .join(", "),
          defaultValue: `I've detailed my monthly living expenses across ${
            categories.length
          } categories. Total monthly expenses: ${getTotalExpenses().toLocaleString()} VNĐ. Breakdown: ${categories
            .map(
              (cat) =>
                `${cat.name}: ${(
                  expenseValues[cat.id] || 0
                ).toLocaleString()} VNĐ`
            )
            .join(
              ", "
            )}. This detailed breakdown will help set up comprehensive budget tracking with individual categories for each expense type.`,
        }),
      });
    } catch (error) {
      console.error("Error submitting expense categories:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3 font-nunito w-full max-w-2xl mx-auto p-2 sm:p-3">
      {/* Header Card */}
      <Card className="bg-white border-0">
        <CardContent className="p-3 sm:p-4 text-center space-y-1 sm:space-y-2">
          <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#0055FF]/10">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#0055FF]" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-[#111827] font-nunito">
            {t("expenseCategoriesTitle", {
              ns: "onboarding",
              defaultValue: "Chi tiết chi phí hàng tháng",
            })}
          </h3>
          <p className="text-xs sm:text-sm text-[#6B7280] font-nunito px-2">
            {t("expenseCategoriesDescription", {
              ns: "onboarding",
              defaultValue: "Nhập số tiền dự kiến cho từng danh mục",
            })}
          </p>
        </CardContent>
      </Card>

      {/* Categories Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-2 sm:space-y-3"
      >
        {categories.map((category) => {
          const IconComponent = getCategoryIcon(category.name, category.id);
          const categoryColor = getCategoryColor(category.name, category.id);
          const hasValue = expenseValues[category.id] > 0;
          const hasError = touched[category.id] && errors[category.id];

          return (
            <Card
              key={category.id}
              className="bg-white border-0 overflow-hidden px-0 md:px-2"
            >
              <CardHeader className="p-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${categoryColor}20` }}
                  >
                    <IconComponent
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      style={{ color: categoryColor }}
                    />
                  </div>
                  <Label className="flex-1 text-sm sm:text-base font-semibold text-[#111827] font-nunito truncate">
                    {category.name}
                    {category.required && (
                      <span className="text-[#F44336] ml-0.5 sm:ml-1 text-xs sm:text-sm">
                        *
                      </span>
                    )}
                  </Label>
                  {hasValue && (
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-[#2ECC71]" />
                      <span className="text-xs sm:text-sm text-[#2ECC71] font-medium font-nunito hidden xs:inline">
                        {expenseValues[category.id].toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0 px-3">
                <MoneyInput
                  label=""
                  value={expenseValues[category.id] || 0}
                  onChange={(value) => handleExpenseChange(category.id, value)}
                  onBlur={() => handleFieldBlur(category.id)}
                  placeholder={category.placeholder}
                  error={hasError ? errors[category.id] : undefined}
                  touched={touched[category.id]}
                  required={category.required}
                />
              </CardContent>
            </Card>
          );
        })}
      </form>

      {/* Summary Card */}
      {getTotalExpenses() > 0 && (
        <Card className="bg-gradient-to-r from-[#0055FF] to-[#0044DD] border-0 sticky bottom-0 z-10">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-xs sm:text-sm text-white font-nunito truncate">
                    {t("totalMonthlyExpenses", {
                      ns: "onboarding",
                      defaultValue: "Tổng chi tiêu hàng tháng",
                    })}
                  </h4>
                  <p className="text-xs sm:text-sm text-white/80 font-nunito">
                    {getFilledCategoriesCount()}/{categories.length}{" "}
                    <span className="hidden sm:inline">
                      {t("categories", {
                        ns: "common",
                        defaultValue: "danh mục",
                      })}
                    </span>
                    <span className="sm:hidden">mục</span>
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-base sm:text-xl font-bold text-white font-nunito">
                  <span className="hidden xs:inline">
                    {getTotalExpenses().toLocaleString("vi-VN")}
                  </span>
                  <span className="xs:hidden">
                    {(getTotalExpenses() / 1000).toFixed(0)}k
                  </span>
                  <span className="text-xs sm:text-sm ml-0.5">₫</span>
                </div>
              </div>
            </div>
            <Progress
              value={(getFilledCategoriesCount() / categories.length) * 100}
              className="h-1.5 sm:h-2 bg-white/20"
            />
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-1 pb-safe px-2 sm:px-0">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || getTotalExpenses() === 0}
          className="w-full sm:w-auto min-w-[100px] sm:min-w-[120px] h-10 sm:h-11 bg-[#0055FF] hover:bg-[#0044DD] text-white font-nunito font-semibold text-sm sm:text-base"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 animate-spin" />
              <span className="text-xs sm:text-sm">
                {t("submitting", {
                  ns: "common",
                  defaultValue: "Đang xử lý...",
                })}
              </span>
            </>
          ) : (
            <>
              <span className="text-xs sm:text-sm">
                {t("continue", { ns: "common", defaultValue: "Tiếp tục" })}
              </span>
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
