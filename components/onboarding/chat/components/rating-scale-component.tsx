"use client";

import { useState } from "react";
import { OnboardingComponent, ComponentResponse } from "@/lib/types/onboarding.types";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";

interface RatingScaleComponentProps {
  component: OnboardingComponent;
  onResponse: (response: ComponentResponse) => Promise<void>;
}

export function RatingScaleComponent({
  component,
  onResponse,
}: RatingScaleComponentProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);
  const [selectedRating, setSelectedRating] = useState<number | null>(
    component.response?.rating || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scale = component.context.scale || { min: 1, max: 5, labels: [] };
  const isCompleted = component.isCompleted;

  const handleRatingSelect = (rating: number) => {
    if (isCompleted) return;
    setSelectedRating(rating);
  };

  const handleSubmit = async () => {
    if (selectedRating === null || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onResponse({
        rating: selectedRating,
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Error submitting response:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = scale.min; i <= scale.max; i++) {
      const isSelected = selectedRating !== null && i <= selectedRating;

      stars.push(
        <button
          key={i}
          onClick={() => handleRatingSelect(i)}
          disabled={isCompleted}
          className={`p-2 rounded-lg transition-all duration-200 ${
            isCompleted ? "cursor-default" : "cursor-pointer hover:bg-[#F0F2F5]"
          }`}
        >
          <Star
            className={`w-8 h-8 transition-colors duration-200 ${
              isSelected
                ? "text-[#FFC107] fill-[#FFC107]"
                : "text-[#E5E7EB] hover:text-[#FFC107]"
            }`}
          />
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <h3 className="text-lg font-semibold text-[#111827] mb-3">
        {component.title}
      </h3>

      {/* Rating Stars */}
      <div className="flex items-center justify-center space-x-2 py-4">
        {renderStars()}
      </div>

      {/* Labels */}
      {scale.labels && scale.labels.length > 0 && (
        <div className="flex justify-between text-sm text-[#6B7280] px-2">
          <span>{scale.labels[0]}</span>
          {scale.labels[scale.labels.length - 1] && (
            <span>{scale.labels[scale.labels.length - 1]}</span>
          )}
        </div>
      )}

      {/* Selected rating display */}
      {selectedRating !== null && (
        <div className="text-center">
          <span className="text-lg font-semibold text-[#0055FF]">
            {selectedRating} / {scale.max}
          </span>
        </div>
      )}

      {/* Submit button */}
      {!isCompleted && (
        <div className="pt-2">
          <Button
            onClick={handleSubmit}
            disabled={selectedRating === null || isSubmitting}
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
    </div>
  );
} 