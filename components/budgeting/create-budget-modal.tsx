"use client";

import { useState } from "react";
import { useAppTranslation } from "@/hooks/use-translation";
import { useBudgetCreate } from "@/hooks/use-budget-create";
import { CreateBudgetRequest } from "@/lib/types/budget.types";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { MoneyInput } from "@/components/ui/money-input";
import {
  inputValidationRules,
  parseFormattedNumber,
} from "@/lib/validation/input-validation";
import { validateField } from "@/lib/validation/form-validation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BUDGET_ICONS, BUDGET_COLORS } from "@/lib/utils/budget-constants";

interface CreateBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateBudgetModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateBudgetModalProps) => {
  const { t } = useAppTranslation(["budgeting", "common"]);
  const { createBudget, isCreating, error } = useBudgetCreate();

  // Form state
  const [formData, setFormData] = useState<CreateBudgetRequest>({
    name: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    color: BUDGET_COLORS[0],
    icon: "wallet",
    category: "general",
    amount: 0,
  });

  // Form validation errors
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // Form touched state
  const [touched, setTouched] = useState<{
    [key: string]: boolean;
  }>({});

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // Validate name using the name validation rule
    const nameError = validateField(formData.name, inputValidationRules.name);
    if (nameError) {
      errors.name = nameError;
    }

    // Validate amount using the money validation rule
    const amountError = validateField(
      formData.amount,
      inputValidationRules.money
    );
    if (amountError) {
      errors.amount = amountError;
    }

    if (formData.month < 1 || formData.month > 12) {
      errors.month = t("validMonthRequired", { ns: "budgeting" });
    }

    if (formData.year < 2020) {
      errors.year = t("validYearRequired", { ns: "budgeting" });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as { [key: string]: boolean });
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    const result = await createBudget(formData);

    if (result) {
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        color: BUDGET_COLORS[0],
        icon: "wallet",
        category: "general",
        amount: 0,
      });
      setValidationErrors({});
      setTouched({});
    }
  };

  const handleInputChange = (
    field: keyof CreateBudgetRequest,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate the field on blur
    if (field === "name") {
      const nameError = validateField(formData.name, inputValidationRules.name);
      if (nameError) {
        setValidationErrors((prev) => ({ ...prev, name: nameError }));
      }
    } else if (field === "amount") {
      const amountError = validateField(
        formData.amount,
        inputValidationRules.money
      );
      if (amountError) {
        setValidationErrors((prev) => ({ ...prev, amount: amountError }));
      }
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form state
    setFormData({
      name: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      color: BUDGET_COLORS[0],
      icon: "wallet",
      category: "general",
      amount: 0,
    });
    setValidationErrors({});
    setTouched({});
  };

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const monthName = new Date(2024, i, 1).toLocaleDateString("en", {
      month: "long",
    });
    return { value: monthNum, label: monthName };
  });

  // Generate year options (current year + 5 years forward)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => {
    const year = currentYear + i;
    return { value: year, label: year.toString() };
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#FFFFFF] border-0 max-w-[480px] rounded-xl p-0 font-nunito">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-[20px] font-semibold text-[#111827] font-nunito leading-[28px]">
              {t("createBudget", { ns: "budgeting" })}
            </DialogTitle>
            <DialogDescription className="text-[14px] text-[#6B7280] font-nunito leading-[20px] mt-2">
              {t("createBudgetDesc", { ns: "budgeting" })}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
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
            <div>
              <label className="block text-sm font-medium text-[#111827]">
                {t("budgetIcon", { ns: "budgeting" })}
              </label>
              <div className="grid grid-cols-6 gap-2 mt-1">
                {BUDGET_ICONS.map((iconItem) => {
                  const IconComponent = iconItem.icon;
                  const isSelected = formData.icon === iconItem.name;
                  return (
                    <button
                      key={iconItem.name}
                      type="button"
                      onClick={() => handleInputChange("icon", iconItem.name)}
                      className={`
                        h-12 w-12 rounded-lg flex items-center justify-center transition-colors
                        ${
                          isSelected
                            ? "bg-[#0055FF] text-white"
                            : "bg-[#F9FAFB] text-[#6B7280] hover:bg-[#F0F2F5]"
                        }
                      `}
                    >
                      <IconComponent className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-[#111827]">
                {t("budgetColor", { ns: "budgeting" })}
              </label>
              <div className="flex flex-wrap gap-3 mt-2">
                {BUDGET_COLORS.map((color) => {
                  const isSelected = formData.color === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleInputChange("color", color)}
                      className={`
                        h-10 w-10 rounded-lg flex items-center justify-center transition-all
                        ${
                          isSelected
                            ? "ring-2 ring-[#0055FF] ring-offset-2 scale-110 shadow-md"
                            : "hover:scale-105"
                        }
                      `}
                      style={{ backgroundColor: color }}
                    >
                      {isSelected && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.3334 4.66667L6.00002 12L2.66669 8.66667"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
              <input type="hidden" name="color" value={formData.color} />
            </div>

            {/* Month and Year Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#111827]">
                  {t("budgetMonth", { ns: "budgeting" })}
                </label>
                <select
                  value={formData.month}
                  onChange={(e) =>
                    handleInputChange("month", parseInt(e.target.value))
                  }
                  className="w-full h-12 px-3 bg-transparent border-0 border-b border-[#E5E7EB] focus:border-[#0055FF] focus:border-b-2 outline-none font-nunito text-[16px] text-[#111827]"
                >
                  {monthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {validationErrors.month && touched.month && (
                  <p className="text-sm text-[#F44336] flex items-center mt-1">
                    <span className="mr-1">⚠</span>
                    {validationErrors.month}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827]">
                  {t("budgetYear", { ns: "budgeting" })}
                </label>
                <select
                  value={formData.year}
                  onChange={(e) =>
                    handleInputChange("year", parseInt(e.target.value))
                  }
                  className="w-full h-12 px-3 bg-transparent border-0 border-b border-[#E5E7EB] focus:border-[#0055FF] focus:border-b-2 outline-none font-nunito text-[16px] text-[#111827]"
                >
                  {yearOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {validationErrors.year && touched.year && (
                  <p className="text-sm text-[#F44336] flex items-center mt-1">
                    <span className="mr-1">⚠</span>
                    {validationErrors.year}
                  </p>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-[#FEF2F2] rounded-lg p-4">
                <p className="text-[#F44336] text-[14px] font-nunito">
                  {error}
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-12 border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] font-nunito"
                disabled={isCreating}
              >
                {t("cancel", { ns: "common" })}
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-[#0055FF] hover:bg-[#0041CC] text-white font-nunito"
                disabled={isCreating}
              >
                {isCreating
                  ? t("creating", { ns: "common" })
                  : t("create", { ns: "common" })}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
