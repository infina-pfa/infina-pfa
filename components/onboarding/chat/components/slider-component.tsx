"use client";

import { useState } from "react";
import { OnboardingComponent, ComponentResponse } from "@/lib/types/onboarding.types";
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
  const [sliderValue, setSliderValue] = useState<number>(
    component.response?.sliderValue || component.data.range?.min || 0
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const range = component.data.range || { min: 0, max: 100, step: 1 };
  const isCompleted = component.isCompleted;

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onResponse({
        sliderValue,
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
    <div className="space-y-4">
      {/* Title */}
      <h3 className="text-lg font-semibold text-[#111827] mb-3">
        {component.title}
      </h3>

      {/* Current Value Display */}
      <div className="text-center">
        <span className="text-2xl font-bold text-[#0055FF]">
          {formatValue(sliderValue)}
        </span>
      </div>

      {/* Slider */}
      <div className="px-4">
        <input
          type="range"
          min={range.min}
          max={range.max}
          step={range.step}
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
          disabled={isCompleted}
          className="w-full h-2 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer slider"
        />
        
        {/* Range labels */}
        <div className="flex justify-between text-sm text-[#6B7280] mt-2">
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
            className="w-full bg-[#0055FF] hover:bg-blue-700 text-white"
          >
            {isSubmitting ? t("submitting") : t("continue")}
          </Button>
        </div>
      )}

      {/* Completed indicator */}
      {isCompleted && (
        <div className="flex items-center justify-center space-x-2 text-[#2ECC71] text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>{t("completed")}</span>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #0055FF;
          border-radius: 50%;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #0055FF;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
} 