"use client";

import { OnboardingStep } from "@/lib/types/onboarding.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { CheckCircle } from "lucide-react";

interface OnboardingProgressProps {
  currentStep: OnboardingStep;
}

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);

  const steps: Array<{ id: OnboardingStep; label: string }> = [
    { id: "ai_welcome", label: t("stepWelcome") },
    { id: "user_introduction", label: t("stepIntroduction") },
    { id: "financial_assessment", label: t("stepAssessment") },
    { id: "risk_assessment", label: t("stepRiskProfile") },
    { id: "goal_setting", label: t("stepGoals") },
    { id: "stage_analysis", label: t("stepAnalysis") },
    { id: "complete", label: t("stepComplete") },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return "completed";
    if (stepIndex === currentStepIndex) return "current";
    return "pending";
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="w-full h-2 bg-[#E5E7EB] rounded-full">
          <div
            className="h-2 bg-[#0055FF] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          
          return (
            <div key={step.id} className="flex flex-col items-center space-y-2">
              {/* Step Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  status === "completed"
                    ? "bg-[#2ECC71] text-white"
                    : status === "current"
                    ? "bg-[#0055FF] text-white"
                    : "bg-[#E5E7EB] text-[#6B7280]"
                }`}
              >
                {status === "completed" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>

              {/* Step Label */}
              <div
                className={`text-xs text-center transition-colors duration-200 ${
                  status === "current"
                    ? "text-[#0055FF] font-medium"
                    : status === "completed"
                    ? "text-[#2ECC71]"
                    : "text-[#6B7280]"
                }`}
              >
                {step.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Step Description */}
      <div className="text-center mt-4">
        <p className="text-sm text-[#6B7280]">
          {t("step")} {currentStepIndex + 1} {t("of")} {steps.length}
        </p>
      </div>
    </div>
  );
} 