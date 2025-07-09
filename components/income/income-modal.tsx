"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormInput, FormTextarea } from "@/components/ui/form-input";
import { MoneyInput } from "@/components/ui/money-input";
import { useIncomeForm } from "@/hooks/use-income-form";
import { useAppTranslation } from "@/hooks/use-translation";
import { Income } from "@/lib/types/income.types";
import { IncomeCategorySelector } from "./income-category-selector";

type IncomeModalMode = "create" | "edit";

interface IncomeModalProps {
  mode: IncomeModalMode;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  income?: Income | null; // Only required for edit mode
  onIncomeCreated?: (income: Income) => Promise<void>;
  onIncomeUpdated?: (income: Income) => Promise<void>;
}

export const IncomeModal = ({
  mode,
  isOpen,
  onClose,
  onSuccess,
  income,
  onIncomeCreated,
  onIncomeUpdated,
}: IncomeModalProps) => {
  const { t } = useAppTranslation(["income", "common"]);

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
  } = useIncomeForm({
    mode,
    isOpen,
    income,
    onSuccess,
    onClose,
    onIncomeCreated,
    onIncomeUpdated,
  });

  // Don't render if in edit mode without income
  if (mode === "edit" && !income) return null;

  // Modal content configuration based on mode
  const modalConfig = {
    create: {
      title: t("createIncome", { ns: "income" }),
      description: t("createIncomeDesc", { ns: "income" }),
      submitText: isLoading
        ? t("creating", { ns: "common" })
        : t("create", { ns: "common" }),
    },
    edit: {
      title: t("editIncome", { ns: "income" }),
      description: t("editIncomeDesc", { ns: "income" }),
      submitText: isLoading
        ? t("updating", { ns: "common" })
        : t("update", { ns: "common" }),
    },
  };

  const config = modalConfig[mode];

  // Recurring period options
  const recurringOptions = [
    { value: "0", label: t("oneTime", { ns: "income" }) },
    { value: "1", label: t("daily", { ns: "income" }) },
    { value: "7", label: t("weekly", { ns: "income" }) },
    { value: "14", label: t("biweekly", { ns: "income" }) },
    { value: "30", label: t("monthly", { ns: "income" }) },
    { value: "90", label: t("quarterly", { ns: "income" }) },
    { value: "365", label: t("yearly", { ns: "income" }) },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#FFFFFF] border-0 max-w-[90vw] sm:max-w-[640px] rounded-xl p-0 font-nunito max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="p-4 md:p-6">
          <DialogHeader className="mb-4 md:mb-6">
            <DialogTitle className="text-[18px] md:text-[20px] font-semibold text-[#111827] font-nunito leading-[24px] md:leading-[28px]">
              {config.title}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Income Name */}
            <FormInput
              label={t("incomeName", { ns: "income" })}
              value={formData.name}
              onChange={(value) => handleInputChange("name", value)}
              onBlur={() => handleFieldBlur("name")}
              placeholder={t("incomeNamePlaceholder", { ns: "income" })}
              error={validationErrors.name}
              touched={touched.name}
              required
            />

            {/* Income Amount */}
            <MoneyInput
              label={t("incomeAmount", { ns: "income" })}
              value={formData.amount || 0}
              onChange={(value) =>
                handleInputChange("amount", parseFormattedNumber(value))
              }
              onBlur={() => handleFieldBlur("amount")}
              placeholder={t("incomeAmountPlaceholder", { ns: "income" })}
              error={validationErrors.amount}
              touched={touched.amount}
              required
            />

            {/* Category Selection */}
            <IncomeCategorySelector
              selectedCategory={formData.category}
              onCategoryChange={(category) =>
                handleInputChange("category", category)
              }
            />

            {/* Recurring Period */}
            <div>
              <label className="block text-[14px] font-bold text-[#111827] font-nunito mb-4">
                {t("recurringPeriod", { ns: "income" })}
              </label>
              <select
                value={formData.recurring.toString()}
                onChange={(e) =>
                  handleInputChange("recurring", parseInt(e.target.value))
                }
                className="h-12 w-full px-3 bg-transparent border-0 border-b border-[#E5E7EB] focus:border-[#0055FF] focus:outline-none font-nunito text-[14px] md:text-[16px]"
              >
                {recurringOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-[12px] text-[#6B7280] font-nunito mt-2">
                {formData.recurring === 0
                  ? t("oneTimeIncomeTooltip", { ns: "income" })
                  : t("recurringIncomeTooltip", { ns: "income" })}
              </p>
            </div>

            {/* Description */}
            <FormTextarea
              label={t("incomeDescription", { ns: "income" })}
              value={formData.description || ""}
              onChange={(value) => handleInputChange("description", value)}
              onBlur={() => handleFieldBlur("description")}
              placeholder={t("incomeDescriptionPlaceholder", { ns: "income" })}
              error={validationErrors.description}
              touched={touched.description}
              rows={3}
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
            <div className="flex flex-col sm:flex-row-reverse gap-3 pt-3 md:pt-4">
              <Button
                type="submit"
                className="flex-1 h-10 md:h-12 bg-[#0055FF] hover:bg-[#0041CC] text-white font-nunito text-sm md:text-base"
                disabled={isLoading}
              >
                {config.submitText}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-10 md:h-12 text-sm md:text-base"
                disabled={isLoading}
              >
                {t("cancel", { ns: "common" })}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
