"use client";

import { useState } from "react";
import { OnboardingComponent, ComponentResponse } from "@/lib/types/onboarding.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { AlertCircle } from "lucide-react";

interface SavingsCapacityComponentProps {
  component: OnboardingComponent;
  onResponse: (response: ComponentResponse) => Promise<void>;
}

export function SavingsCapacityComponent({
  component,
  onResponse,
}: SavingsCapacityComponentProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);
  
  const incomeHint = component.context.incomeHint;
  const savingsHint = component.context.savingsHint;
  
  const [savingsAmount, setSavingsAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSavingsChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setSavingsAmount(numValue);
    
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const validateAmount = () => {
    if (savingsAmount <= 0) {
      setError(t("savingsAmountRequired"));
      return false;
    }
    if (savingsAmount < 100000) {
      setError(t("savingsAmountTooLow"));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateAmount() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onResponse({
        savingsCapacity: savingsAmount,
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Error submitting savings capacity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-nunito">
      {/* Hints */}
      <div className="space-y-3">
        {incomeHint && (
          <div className="flex items-start space-x-3 p-4 bg-[#E3F2FD] rounded-lg">
            <AlertCircle className="text-[#0055FF] flex-shrink-0 mt-0.5" size={16} />
            <p className="text-sm text-[#0055FF]">
              {incomeHint}
            </p>
          </div>
        )}
        
        {savingsHint && (
          <div className="flex items-start space-x-3 p-4 bg-[#FFF3E0] rounded-lg">
            <AlertCircle className="text-[#FF9800] flex-shrink-0 mt-0.5" size={16} />
            <p className="text-sm text-[#FF9800]">
              {savingsHint}
            </p>
          </div>
        )}
      </div>

      {/* Savings Input */}
      <div className="space-y-4">
        <MoneyInput
          label={t("monthlySavingsCapacity")}
          value={savingsAmount}
          onChange={handleSavingsChange}
          placeholder={t("savingsCapacityPlaceholder")}
          required
          error={error}
          touched={!!error}
          className="w-full"
        />
        
        {savingsAmount > 0 && (
          <div className="bg-[#F0F2F5] p-4 rounded-lg">
            <h4 className="font-medium text-[#111827] mb-2">
              {t("savingsProjection")}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">{t("monthly")}</span>
                <span className="font-medium text-[#111827]">
                  {savingsAmount.toLocaleString()} VND
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">{t("quarterly")}</span>
                <span className="font-medium text-[#111827]">
                  {(savingsAmount * 3).toLocaleString()} VND
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">{t("yearly")}</span>
                <span className="font-bold text-[#0055FF]">
                  {(savingsAmount * 12).toLocaleString()} VND
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-[#F6F7F9] p-4 rounded-lg">
        <h4 className="font-medium text-[#111827] mb-2">
          {t("savingsTips")}
        </h4>
        <ul className="space-y-1 text-sm text-[#6B7280]">
          <li className="flex items-start space-x-2">
            <span className="text-[#0055FF] mt-1">•</span>
            <span>{t("savingsTip1")}</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-[#0055FF] mt-1">•</span>
            <span>{t("savingsTip2")}</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-[#0055FF] mt-1">•</span>
            <span>{t("savingsTip3")}</span>
          </li>
        </ul>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || savingsAmount <= 0}
          className={`
            px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200
            ${savingsAmount > 0 && !isSubmitting
              ? 'bg-[#0055FF] text-white hover:bg-[#0055FF]/90' 
              : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? t("submitting") : t("continue")}
        </Button>
      </div>
    </div>
  );
} 