"use client";

import { useTranslation } from "react-i18next";
import { OnboardingStep } from "@/hooks/use-onboarding";

interface OnboardingProgressProps {
  currentStep: OnboardingStep;
}

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  const { t } = useTranslation();

  const getStepNumber = (step: OnboardingStep): number => {
    switch (step) {
      case "welcome":
        return 1;
      case "name":
        return 2;
      case "loading":
        return 3;
      default:
        return 1;
    }
  };

  const stepNumber = getStepNumber(currentStep);
  const totalSteps = 3;

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      {/* Progress Bar */}
      <div className="flex items-center mb-4">
        {Array.from({ length: totalSteps }, (_, index) => {
          const isActive = index + 1 <= stepNumber;
          const isCompleted = index + 1 < stepNumber;

          return (
            <div key={index} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                  isActive
                    ? "bg-[#0055FF] text-white"
                    : "bg-white border-2 border-[#E5E7EB] text-[#6B7280]"
                }`}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-colors duration-200 ${
                    index + 1 < stepNumber ? "bg-[#0055FF]" : "bg-[#E5E7EB]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Label */}
      <div className="text-center">
        <span className="text-sm text-[#6B7280]">
          {t(`step${stepNumber}of3`)}
        </span>
      </div>
    </div>
  );
}
