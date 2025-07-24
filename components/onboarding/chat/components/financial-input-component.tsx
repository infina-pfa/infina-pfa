"use client";

import { useState } from "react";
import {
  OnboardingComponent,
  ComponentResponse,
} from "@/lib/types/onboarding.types";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { CheckCircle } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";

interface FinancialInputComponentProps {
  component: OnboardingComponent;
  onResponse: (response: ComponentResponse) => Promise<void>;
}

export function FinancialInputComponent({
  component,
  onResponse,
}: FinancialInputComponentProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);
  const [financialValue, setFinancialValue] = useState<string>(
    component.response?.financialValue?.toString() || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCompleted = component.isCompleted;
  const inputType = component.context.inputType || "income";

  const handleSubmit = async () => {
    const numericValue = parseFloat(financialValue);
    if (
      !financialValue ||
      numericValue < 0 ||
      isNaN(numericValue) ||
      isSubmitting
    )
      return;

    setIsSubmitting(true);
    try {
      await onResponse({
        financialValue: numericValue,
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Error submitting response:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = () => {
    const numericValue = parseFloat(financialValue);
    return financialValue && numericValue >= 0 && !isNaN(numericValue);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Title */}
      <h3 className="text-base sm:text-lg font-semibold text-[#111827] mb-2 sm:mb-3">
        {component.title}
      </h3>

      {/* Financial Input */}
      <div className="space-y-2">
        <MoneyInput
          label={t(`${inputType}Amount`)}
          value={financialValue}
          onChange={setFinancialValue}
          placeholder={t(
            `enter${inputType.charAt(0).toUpperCase() + inputType.slice(1)}`
          )}
          disabled={isCompleted}
        />
      </div>

      {/* Submit button */}
      {!isCompleted && (
        <div className="pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!isValid() || isSubmitting}
            className="w-full bg-[#0055FF] hover:bg-blue-700 text-white h-12 sm:h-10 min-h-[48px] sm:min-h-0 text-sm sm:text-base"
          >
            {isSubmitting ? t("submitting") : t("continue")}
          </Button>
        </div>
      )}

      {/* Completed indicator */}
      {isCompleted && (
        <div className="flex items-center space-x-2 text-[#2ECC71] text-xs sm:text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>{t("completed")}</span>
        </div>
      )}
    </div>
  );
}
