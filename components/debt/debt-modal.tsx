"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormInput } from "@/components/ui/form-input";
import { MoneyInput } from "@/components/ui/money-input";
import { useDebtForm } from "@/hooks/use-debt-form";
import { useAppTranslation } from "@/hooks/use-translation";
import { DebtResponse } from "@/lib/types/debt.types";
import { CalendarIcon } from "lucide-react";

type DebtModalMode = "create" | "edit";

interface DebtModalProps {
  mode: DebtModalMode;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  debt?: DebtResponse | null;
  onDebtCreated?: (debt: DebtResponse) => Promise<void>;
  onDebtUpdated?: (debt: DebtResponse) => Promise<void>;
}

export const DebtModal = ({
  mode,
  isOpen,
  onClose,
  onSuccess,
  debt,
  onDebtCreated,
  onDebtUpdated,
}: DebtModalProps) => {
  const { t } = useAppTranslation(["debt", "common"]);

  // Use custom hook for form logic
  const {
    formData,
    validationErrors,
    touched,
    isLoading,
    handleSubmit,
    handleInputChange,
    handleFieldBlur,
    handleClose,
    parseFormattedNumber,
  } = useDebtForm({
    mode,
    isOpen,
    debt,
    onSuccess,
    onClose,
    onDebtCreated,
    onDebtUpdated,
  });

  // Don't render if in edit mode without debt
  if (mode === "edit" && !debt) return null;

  // Modal content configuration based on mode
  const modalConfig = {
    create: {
      title: t("createDebt"),
      submitText: isLoading
        ? t("creating", { ns: "common" })
        : t("create", { ns: "common" }),
    },
    edit: {
      title: t("editDebt"),
      submitText: isLoading
        ? t("updating", { ns: "common" })
        : t("update", { ns: "common" }),
    },
  };

  const config = modalConfig[mode];

  // Format date for input
  const formatDateForInput = (date: string) => {
    if (!date) return "";
    // If already in YYYY-MM-DD format, return as is
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) return date;
    // Otherwise convert from ISO string
    return date.split("T")[0];
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0];

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
            {/* Lender Name */}
            <FormInput
              label={t("lender")}
              value={formData.lender}
              onChange={(value) => handleInputChange("lender", value)}
              onBlur={() => handleFieldBlur("lender")}
              placeholder={t("enterLender")}
              error={validationErrors.lender}
              touched={touched.lender}
              required
            />

            {/* Purpose */}
            <FormInput
              label={t("purpose")}
              value={formData.purpose}
              onChange={(value) => handleInputChange("purpose", value)}
              onBlur={() => handleFieldBlur("purpose")}
              placeholder={t("enterPurpose")}
              error={validationErrors.purpose}
              touched={touched.purpose}
              required
            />

            {/* Amount */}
            <MoneyInput
              label={t("amount")}
              value={formData.amount || 0}
              onChange={(value) =>
                handleInputChange("amount", parseFormattedNumber(value))
              }
              onBlur={() => handleFieldBlur("amount")}
              placeholder={t("enterAmount")}
              error={validationErrors.amount}
              touched={touched.amount}
              required
              disabled={mode === "edit"} // Cannot edit amount in edit mode
            />

            {/* Interest Rate */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 font-nunito">
                {t("interestRate")}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.rate}
                  onChange={(e) =>
                    handleInputChange("rate", parseFloat(e.target.value) || 0)
                  }
                  onBlur={() => handleFieldBlur("rate")}
                  placeholder={t("enterInterestRate")}
                  className={`w-full px-3 py-2 border rounded-lg font-nunito ${
                    validationErrors.rate && touched.rate
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#0055FF]`}
                  step="0.01"
                  min="0"
                  max="100"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  %
                </span>
              </div>
              {validationErrors.rate && touched.rate && (
                <p className="text-sm text-red-500 font-nunito">
                  {validationErrors.rate}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 font-nunito">
                {t("dueDate")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formatDateForInput(formData.dueDate)}
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                  onBlur={() => handleFieldBlur("dueDate")}
                  min={today}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg font-nunito ${
                    validationErrors.dueDate && touched.dueDate
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#0055FF]`}
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
              {validationErrors.dueDate && touched.dueDate && (
                <p className="text-sm text-red-500 font-nunito">
                  {validationErrors.dueDate}
                </p>
              )}
            </div>

            {/* Current Paid Amount (only for create mode) */}
            {mode === "create" && (
              <MoneyInput
                label={t("currentPaidAmount", { ns: "debt" })}
                value={formData.currentPaidAmount || 0}
                onChange={(value) =>
                  handleInputChange("currentPaidAmount", parseFormattedNumber(value))
                }
                placeholder={t("enterCurrentPaidAmount", { ns: "debt" })}
              />
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
                className="flex-1 h-10 md:h-12 text-sm md:text-base font-nunito"
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