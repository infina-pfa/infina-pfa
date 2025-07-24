"use client";

import { useState } from "react";
import { OnboardingComponent, ComponentResponse } from "@/lib/types/onboarding.types";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";

interface MultipleChoiceComponentProps {
  component: OnboardingComponent;
  onResponse: (response: ComponentResponse) => Promise<void>;
}

export function MultipleChoiceComponent({
  component,
  onResponse,
}: MultipleChoiceComponentProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);
  const [selectedOption, setSelectedOption] = useState<string | null>(
    component.response?.selectedOption || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const options = component.context.options || [];
  const isCompleted = component.isCompleted;

  const handleOptionSelect = (optionId: string) => {
    if (isCompleted) return;
    setSelectedOption(optionId);
  };

  const handleSubmit = async () => {
    if (!selectedOption || isSubmitting) return;

    // Find the selected option by ID to get its label
    const selectedOptionData = options.find(option => option.id === selectedOption);
    if (!selectedOptionData) {
      console.error("Selected option not found:", selectedOption);
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit the label instead of the ID
      await onResponse({
        selectedOption: selectedOptionData.label,
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Error submitting response:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Title */}
      <h3 className="text-base sm:text-lg font-semibold text-[#111827] mb-2 sm:mb-3">
        {component.title}
      </h3>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isDisabled = isCompleted && !isSelected;

          return (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              disabled={isCompleted}
              className={`w-full p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                isSelected
                  ? "border-[#0055FF] bg-[#0055FF] bg-opacity-5"
                  : isDisabled
                  ? "border-[#E5E7EB] bg-[#F9FAFB] opacity-50"
                  : "border-[#E5E7EB] bg-white hover:border-[#0055FF] hover:bg-[#0055FF] hover:bg-opacity-5"
              } ${
                isCompleted ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Selection indicator */}
                <div className="flex-shrink-0 mt-0.5">
                  {isSelected ? (
                    <CheckCircle className="w-5 h-5 text-[#0055FF]" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#9CA3AF]" />
                  )}
                </div>

                {/* Option content */}
                <div className="flex-1">
                  <div className="font-medium text-[#111827] mb-1 text-sm sm:text-base">
                    {option.label}
                  </div>
                  {option.description && (
                    <div className="text-xs sm:text-sm text-[#6B7280]">
                      {option.description}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Submit button */}
      {!isCompleted && (
        <div className="pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!selectedOption || isSubmitting}
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