"use client";

import { useAppTranslation } from "@/hooks/use-translation";
import { useBudgetForm } from "@/hooks/use-budget-form";
import { Budget } from "@/lib/types/budget.types";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { MoneyInput } from "@/components/ui/money-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BudgetIconSelector } from "./budget-icon-selector";
import { BudgetColorSelector } from "./budget-color-selector";
import { BudgetMonthYearSelector } from "./budget-month-year-selector";

type BudgetModalMode = "create" | "edit";

interface BudgetModalProps {
  mode: BudgetModalMode;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  budget?: Budget | null; // Only required for edit mode
}

export const BudgetModal = ({
  mode,
  isOpen,
  onClose,
  onSuccess,
  budget,
}: BudgetModalProps) => {
  const { t } = useAppTranslation(["budgeting", "common"]);

  // Use custom hook for form logic
  const {
    formData,
    validationErrors,
    touched,
    isLoading,
    error,
    handleSubmit,
    handleInputChange,
    handleFieldBlur,
    handleClose,
    parseFormattedNumber,
  } = useBudgetForm({
    mode,
    isOpen,
    budget,
    onSuccess,
    onClose,
  });

  // Don't render if in edit mode without budget
  if (mode === "edit" && !budget) return null;

  // Modal content configuration based on mode
  const modalConfig = {
    create: {
      title: t("createBudget", { ns: "budgeting" }),
      description: t("createBudgetDesc", { ns: "budgeting" }),
      submitText: isLoading
        ? t("creating", { ns: "common" })
        : t("create", { ns: "common" }),
    },
    edit: {
      title: t("editBudget", { ns: "budgeting" }),
      description: t("editBudgetDesc", { ns: "budgeting" }),
      submitText: isLoading
        ? t("updating", { ns: "common" })
        : t("update", { ns: "common" }),
    },
  };

  const config = modalConfig[mode];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#FFFFFF] border-0 max-w-[90vw] sm:max-w-[480px] rounded-xl p-0 font-nunito max-h-[90vh] overflow-y-auto">
        <div className="p-4 md:p-6">
          <DialogHeader className="mb-4 md:mb-6">
            <DialogTitle className="text-[18px] md:text-[20px] font-semibold text-[#111827] font-nunito leading-[24px] md:leading-[28px]">
              {config.title}
            </DialogTitle>
            <DialogDescription className="text-[12px] md:text-[14px] text-[#6B7280] font-nunito leading-[16px] md:leading-[20px] mt-1 md:mt-2">
              {config.description}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Budget Name */}
            <FormInput
              label={t("budgetName", { ns: "budgeting" })}
              value={formData.name}
              onChange={(value) => handleInputChange("name", value)}
              onBlur={() => handleFieldBlur("name")}
              placeholder={t("enterBudgetName", { ns: "budgeting" })}
              error={validationErrors.name}
              touched={touched.name}
              required
            />

            {/* Budget Amount */}
            <MoneyInput
              label={t("budgetAmount", { ns: "budgeting" })}
              value={formData.amount || 0}
              onChange={(value) =>
                handleInputChange("amount", parseFormattedNumber(value))
              }
              onBlur={() => handleFieldBlur("amount")}
              placeholder={t("enterBudgetAmount", { ns: "budgeting" })}
              error={validationErrors.amount}
              touched={touched.amount}
              required
            />

            {/* Icon Selection */}
            <BudgetIconSelector
              selectedIcon={formData.icon}
              onIconChange={(icon) => handleInputChange("icon", icon)}
            />

            {/* Color Selection */}
            <BudgetColorSelector
              selectedColor={formData.color}
              onColorChange={(color) => handleInputChange("color", color)}
            />

            {/* Month and Year Selection */}
            <BudgetMonthYearSelector
              selectedMonth={formData.month}
              selectedYear={formData.year}
              onMonthChange={(month) => handleInputChange("month", month)}
              onYearChange={(year) => handleInputChange("year", year)}
              validationErrors={validationErrors}
              touched={touched}
            />

            {/* Error Display */}
            {error && (
              <div className="bg-[#FEF2F2] rounded-lg p-3 md:p-4">
                <p className="text-[#F44336] text-[12px] md:text-[14px] font-nunito">
                  {error}
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 md:pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-10 md:h-12 border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] font-nunito text-sm md:text-base"
                disabled={isLoading}
              >
                {t("cancel", { ns: "common" })}
              </Button>
              <Button
                type="submit"
                className="flex-1 h-10 md:h-12 bg-[#0055FF] hover:bg-[#0041CC] text-white font-nunito text-sm md:text-base"
                disabled={isLoading}
              >
                {config.submitText}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
