"use client";

import { OnboardingStep } from "@/lib/types/onboarding.types";
import { useAppTranslation } from "@/hooks/use-translation";

interface OnboardingProgressProps {
  currentStep: OnboardingStep;
}

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);

  const steps: OnboardingStep[] = [
    "ai_welcome",
    "user_introduction", 
    "financial_assessment",
    "risk_assessment",
    "goal_setting",
    "stage_analysis",
    "complete"
  ];

  const currentStepIndex = steps.findIndex(step => step === currentStep);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="w-full">
      {/* Simplified Progress Bar */}
      <div className="relative">
        <div className="w-full h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0055FF] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Simple step indicator text */}
      <div className="text-center mt-2">
        <p className="text-xs text-[#6B7280]">
          {t("step")} {currentStepIndex + 1} {t("of")} {steps.length}
        </p>
      </div>
    </div>
  );
} 