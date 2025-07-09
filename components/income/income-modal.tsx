"use client";

import { useIncomeForm } from "@/hooks/use-income-form";
import { useAppTranslation } from "@/hooks/use-translation";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { MoneyInput } from "@/components/ui/money-input";
import { INCOME_CATEGORIES, Income } from "@/lib/types/income.types";

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

  const title = mode === "create" ? t("createIncome") : t("editIncome");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {/* Mobile: Fullscreen, Desktop: Centered modal */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={handleClose}
          aria-hidden="true"
        />

        {/* Modal Content */}
        <div className="relative bg-white w-full sm:w-auto sm:max-w-[480px] sm:mx-4 rounded-t-[12px] sm:rounded-[12px] max-h-[90vh] sm:max-h-[80vh] overflow-hidden">
          {/* Header - Mobile optimized */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-[#E5E7EB]">
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#111827] font-nunito">
              {title}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={t("close", { ns: "common" })}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form Content - Mobile optimized */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] sm:max-h-none">
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-3">
                  <p className="text-[#DC2626] text-[14px] font-nunito">
                    {error}
                  </p>
                </div>
              )}

              {/* Income Name */}
              <div>
                <FormInput
                  label={t("incomeName")}
                  type="text"
                  value={formData.name}
                  onChange={(value) => handleInputChange("name", value)}
                  onBlur={() => handleFieldBlur("name")}
                  error={touched.name ? validationErrors.name : undefined}
                  placeholder={t("incomeNamePlaceholder")}
                  required
                />
              </div>

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
                <label className="block text-[14px] font-bold text-[#111827] font-nunito mb-1">
                  {t("category")}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="w-full h-12 px-3 bg-transparent border-0 border-b border-[#E5E7EB] focus:border-[#0055FF] focus:outline-none font-nunito text-[16px]"
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
                  <option value={INCOME_CATEGORIES.SALARY}>
                    {t("salary")}
                  </option>
                  <option value={INCOME_CATEGORIES.FREELANCE}>
                    {t("freelance")}
                  </option>
                  <option value={INCOME_CATEGORIES.BUSINESS}>
                    {t("business")}
                  </option>
                  <option value={INCOME_CATEGORIES.INVESTMENT}>
                    {t("investment")}
                  </option>
                  <option value={INCOME_CATEGORIES.OTHER}>{t("other")}</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <FormInput
                  label={t("description", { ns: "common" })}
                  type="text"
                  value={formData.description || ""}
                  onChange={(value) => handleInputChange("description", value)}
                  onBlur={() => handleFieldBlur("description")}
                  error={
                    touched.description
                      ? validationErrors.description
                      : undefined
                  }
                  placeholder={
                    t("descriptionPlaceholder", { ns: "common" }) ||
                    "Enter description"
                  }
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-[14px] font-bold text-[#111827] font-nunito mb-1">
                  {t("frequency")}
                </label>
                <select
                  value={formData.recurring.toString()}
                  onChange={(e) =>
                    handleInputChange("recurring", parseInt(e.target.value))
                  }
                  className="w-full h-12 px-3 bg-transparent border-0 border-b border-[#E5E7EB] focus:border-[#0055FF] focus:outline-none font-nunito text-[16px]"
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
                  <option value="7">{t("weekly")}</option>
                  <option value="14">{t("biweekly")}</option>
                  <option value="30">{t("monthly")}</option>
                  <option value="90">{t("quarterly")}</option>
                  <option value="365">{t("yearly")}</option>
                  <option value="0">{t("oneTime")}</option>
                </select>
              </div>

              {/* Actions - Mobile optimized */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-white border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] font-nunito px-6 py-3 rounded-[9999px] min-h-[44px]"
                >
                  {t("cancel", { ns: "common" })}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-[#0055FF] hover:bg-[#0041CC] text-white font-nunito px-6 py-3 rounded-[9999px] min-h-[44px] disabled:opacity-50"
                >
                  {isLoading
                    ? t("saving", { ns: "common" })
                    : mode === "create"
                    ? t("createIncome")
                    : t("updateIncome", { ns: "income" })}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
