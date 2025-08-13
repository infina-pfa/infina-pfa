"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoneyInput } from "@/components/ui/money-input";
import { useIncomeForm } from "@/hooks/use-income-form";
import { useAppTranslation } from "@/hooks/use-translation";
import { Income } from "@/lib/types/income.types";

interface IncomeModalProps {
  mode: "create" | "edit";
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  income?: Income | null;
  onIncomeCreated?: (income: Income) => Promise<void>;
  onIncomeUpdated?: (income: Income) => Promise<void>;
}

export function IncomeModal({
  mode,
  isOpen,
  onClose,
  onSuccess,
  income,
  onIncomeCreated,
  onIncomeUpdated,
}: IncomeModalProps) {
  const { t } = useAppTranslation(["income", "common"]);

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
  } = useIncomeForm({
    mode,
    isOpen,
    income,
    onSuccess,
    onClose,
    onIncomeCreated,
    onIncomeUpdated,
  });

  const title = mode === "create" ? t("createIncome") : t("editIncome");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] p-0 font-nunito overflow-hidden border-0">
        <DialogHeader className="p-4 md:p-6">
          <DialogTitle className="text-[20px] md:text-[24px] font-bold text-[#111827]">
            {title}
          </DialogTitle>
          <DialogClose className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors" />
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)] sm:max-h-[60vh]">
          <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
            {/* Amount */}
            <div>
              <MoneyInput
                label={t("amount")}
                value={formData.amount}
                onChange={(value) =>
                  handleInputChange(
                    "amount",
                    parseFormattedNumber(value.toString())
                  )
                }
                onBlur={() => handleFieldBlur("amount")}
                error={touched.amount ? validationErrors.amount : undefined}
                placeholder={t("amountPlaceholder")}
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[14px] font-bold text-[#111827] mb-1">
                {t("category")}
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full h-12 px-3 bg-transparent border-0 border-b border-[#E5E7EB] focus:border-[#0055FF] focus:outline-none text-[16px]"
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 8px center",
                  backgroundSize: "20px",
                }}
              >
                <option value="Salary">{t("salary")}</option>
                <option value="Freelance">{t("freelance")}</option>
                <option value="Business">{t("business")}</option>
                <option value="Investment">{t("investment")}</option>
                <option value="Other">{t("other")}</option>
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-[14px] font-bold text-[#111827] mb-1">
                {t("frequency")}
              </label>
              <select
                value={formData.recurring.toString()}
                onChange={(e) =>
                  handleInputChange("recurring", parseInt(e.target.value))
                }
                className="w-full h-12 px-3 bg-transparent border-0 border-b border-[#E5E7EB] focus:border-[#0055FF] focus:outline-none text-[16px]"
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 8px center",
                  backgroundSize: "20px",
                }}
              >
                <option value="30">{t("monthly")}</option>
                <option value="0">{t("oneTime")}</option>
              </select>
            </div>

            {/* Actions */}
            <DialogFooter className="flex flex-col sm:flex-row-reverse gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto bg-[#0055FF] hover:bg-[#0041CC] text-white px-6 py-3 rounded-[9999px] min-h-[44px] disabled:opacity-50"
              >
                {isLoading
                  ? t("saving", { ns: "common" })
                  : mode === "create"
                  ? t("createIncome")
                  : t("updateIncome", { ns: "income" })}
              </Button>
              <Button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="w-full sm:w-auto bg-white border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] px-6 py-3 rounded-[9999px] min-h-[44px]"
              >
                {t("cancel", { ns: "common" })}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
