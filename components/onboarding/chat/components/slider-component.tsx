"use client";

import { useState } from "react";
import {
  OnboardingComponent,
  ComponentResponse,
} from "@/lib/types/onboarding.types";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";

interface SliderComponentProps {
  component: OnboardingComponent;
  onResponse: (response: ComponentResponse) => Promise<void>;
}

export function SliderComponent({
  component,
  onResponse,
}: SliderComponentProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);
  const defaultValue = component.context.range?.default || 0;
  const [sliderValue, setSliderValue] = useState<number>(
    component.response?.sliderValue || defaultValue
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const range = component.context.range || { min: 0, max: 100, step: 1 };
  const isCompleted = component.isCompleted;

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onResponse({
        sliderValue,
        sliderUnit: range.unit, // Include unit from context
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Error submitting response:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatValue = (value: number) => {
    return range.unit ? `${value} ${range.unit}` : value.toString();
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Title */}
      <h3 className="text-base sm:text-lg font-semibold text-[#111827] mb-2 sm:mb-3">
        {component.title}
      </h3>

      {/* Current Value Display */}
      <div className="text-center">
        <span className="text-xl sm:text-2xl font-bold text-[#0055FF]">
          {formatValue(sliderValue)}
        </span>
      </div>

      {/* Slider */}
      <div className="px-2 sm:px-4 py-2">
        <input
          type="range"
          min={range.min}
          max={range.max}
          step={range.step}
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
          disabled={isCompleted}
          className="w-full h-2 sm:h-2 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer slider touch-manipulation"
        />

        {/* Range labels */}
        <div className="flex justify-between text-xs sm:text-sm text-[#6B7280] mt-3 sm:mt-2">
          <span>{formatValue(range.min)}</span>
          <span>{formatValue(range.max)}</span>
        </div>
      </div>

      {/* Submit button */}
      {!isCompleted && (
        <div className="pt-2">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-[#0055FF] hover:bg-blue-700 text-white h-12 sm:h-10 min-h-[48px] sm:min-h-0 text-sm sm:text-base"
          >
            {isSubmitting ? t("submitting") : t("continue")}
          </Button>
        </div>
      )}

      {/* Completed indicator */}
      {isCompleted && (
        <div className="flex items-center justify-center space-x-2 text-[#2ECC71] text-xs sm:text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>{t("completed")}</span>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 44px;
          height: 44px;
          background: #0055ff;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 85, 255, 0.2);
          transition: transform 0.2s ease;
        }

        .slider::-webkit-slider-thumb:active {
          transform: scale(1.1);
        }

        .slider::-moz-range-thumb {
          width: 44px;
          height: 44px;
          background: #0055ff;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 85, 255, 0.2);
          transition: transform 0.2s ease;
        }

        .slider::-moz-range-thumb:active {
          transform: scale(1.1);
        }

        @media (min-width: 640px) {
          .slider::-webkit-slider-thumb {
            width: 24px;
            height: 24px;
          }

          .slider::-moz-range-thumb {
            width: 24px;
            height: 24px;
          }
        }
      `}</style>
    </div>
  );
}
