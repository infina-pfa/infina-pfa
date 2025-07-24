import React from "react";
import { cn } from "@/lib/utils";
import { useAppTranslation } from "@/hooks/use-translation";
import { useSpendingForm } from "@/hooks/use-spending-form";
import { MoneyInput } from "@/components/ui/money-input";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/validation/input-validation";
import {
  SpendingFormProps,
  SPENDING_CATEGORIES,
} from "@/lib/types/spending.types";

export const SpendingForm: React.FC<SpendingFormProps> = ({
  title,
  description,
  onUserSubmit,
  initialData,
  isLoading: externalLoading = false,
  disabled = false,
}) => {
  const { t } = useAppTranslation(["spending", "common"]);

  const {
    formData,
    validationErrors,
    touched,
    isFormValid,
    totalAmount,
    handleSubmit,
    handleInputChange,
    handleFieldBlur,
  } = useSpendingForm({
    onUserSubmit,
    initialData,
  });

  const isLoading = externalLoading;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header Section - Compact for chat */}
      <div className="text-center mb-4">
        <h2 className="text-[18px] font-bold text-[#111827] font-nunito mb-2">
          {title}
        </h2>
        <p className="text-[14px] text-[#6B7280] font-nunito leading-[18px]">
          {description}
        </p>
      </div>

      {/* Form Container - Mobile-first design */}
      <div className="bg-[#F0F2F5] rounded-[12px] p-4">
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-label={t("formAriaLabel")}
        >
          {/* Input Stack - Single column for mobile-first */}
          <div className="space-y-4">
            {/* Housing */}
            <div className="space-y-1">
              <MoneyInput
                label={t("housingLabel")}
                value={formData.housing.toString()}
                onChange={(value) =>
                  handleInputChange(SPENDING_CATEGORIES.HOUSING, value)
                }
                onBlur={() => handleFieldBlur(SPENDING_CATEGORIES.HOUSING)}
                error={touched.housing ? validationErrors.housing : undefined}
                placeholder={t("housingPlaceholder")}
                required
                disabled={disabled || isLoading}
                aria-label={t("categoryFieldAriaLabel", {
                  category: t("housingLabel"),
                })}
              />
              <p className="text-[11px] text-[#6B7280] font-nunito px-4">
                {t("housingDescription")}
              </p>
            </div>

            {/* Food */}
            <div className="space-y-1">
              <MoneyInput
                label={t("foodLabel")}
                value={formData.food.toString()}
                onChange={(value) =>
                  handleInputChange(SPENDING_CATEGORIES.FOOD, value)
                }
                onBlur={() => handleFieldBlur(SPENDING_CATEGORIES.FOOD)}
                error={touched.food ? validationErrors.food : undefined}
                placeholder={t("foodPlaceholder")}
                required
                disabled={disabled || isLoading}
                aria-label={t("categoryFieldAriaLabel", {
                  category: t("foodLabel"),
                })}
              />
              <p className="text-[11px] text-[#6B7280] font-nunito px-4">
                {t("foodDescription")}
              </p>
            </div>

            {/* Transportation */}
            <div className="space-y-1">
              <MoneyInput
                label={t("transportationLabel")}
                value={formData.transportation.toString()}
                onChange={(value) =>
                  handleInputChange(SPENDING_CATEGORIES.TRANSPORTATION, value)
                }
                onBlur={() =>
                  handleFieldBlur(SPENDING_CATEGORIES.TRANSPORTATION)
                }
                error={
                  touched.transportation
                    ? validationErrors.transportation
                    : undefined
                }
                placeholder={t("transportationPlaceholder")}
                required
                disabled={disabled || isLoading}
                aria-label={t("categoryFieldAriaLabel", {
                  category: t("transportationLabel"),
                })}
              />
              <p className="text-[11px] text-[#6B7280] font-nunito px-4">
                {t("transportationDescription")}
              </p>
            </div>

            {/* Other */}
            <div className="space-y-1">
              <MoneyInput
                label={t("otherLabel")}
                value={formData.other.toString()}
                onChange={(value) =>
                  handleInputChange(SPENDING_CATEGORIES.OTHER, value)
                }
                onBlur={() => handleFieldBlur(SPENDING_CATEGORIES.OTHER)}
                error={touched.other ? validationErrors.other : undefined}
                placeholder={t("otherPlaceholder")}
                required
                disabled={disabled || isLoading}
                aria-label={t("categoryFieldAriaLabel", {
                  category: t("otherLabel"),
                })}
              />
              <p className="text-[11px] text-[#6B7280] font-nunito px-4">
                {t("otherDescription")}
              </p>
            </div>
          </div>

          {/* Total Display - Compact for chat */}
          <div className="bg-white rounded-[8px] p-3 mt-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-[14px] font-semibold text-[#111827] font-nunito">
                  {t("totalSpending")}
                </h3>
                <p className="text-[11px] text-[#6B7280] font-nunito">
                  {t("allFieldsRequired")}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "text-[16px] font-bold font-nunito",
                    totalAmount > 0 ? "text-[#111827]" : "text-[#9CA3AF]"
                  )}
                  aria-label={t("totalAriaLabel")}
                >
                  {formatVND(totalAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button - Full width for mobile */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={!isFormValid || disabled || isLoading}
              className={cn(
                "w-full py-3 text-[14px] font-semibold font-nunito rounded-[8px] min-h-[44px] transition-all duration-200",
                isFormValid && !disabled && !isLoading
                  ? "bg-[#0055FF] hover:bg-[#0041CC] text-white"
                  : "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed"
              )}
            >
              {isLoading ? t("submitting") : t("submitButton")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

SpendingForm.displayName = "SpendingForm";
