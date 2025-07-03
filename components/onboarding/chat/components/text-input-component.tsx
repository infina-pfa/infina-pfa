"use client";

import { useState } from "react";
import { OnboardingComponent, ComponentResponse } from "@/lib/types/onboarding.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";

interface TextInputComponentProps {
  component: OnboardingComponent;
  onResponse: (response: ComponentResponse) => Promise<void>;
}

export function TextInputComponent({
  component,
  onResponse,
}: TextInputComponentProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);
  const [textValue, setTextValue] = useState<string>(
    component.response?.textValue || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCompleted = component.isCompleted;
  const validation = component.data.validation || {};

  const handleSubmit = async () => {
    if (!textValue.trim() || isSubmitting) return;

    // Basic validation
    if (validation.required && !textValue.trim()) return;
    if (validation.minLength && textValue.length < validation.minLength) return;
    if (validation.maxLength && textValue.length > validation.maxLength) return;

    setIsSubmitting(true);
    try {
      await onResponse({
        textValue: textValue.trim(),
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Error submitting response:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = () => {
    if (!textValue.trim()) return false;
    if (validation.minLength && textValue.length < validation.minLength) return false;
    if (validation.maxLength && textValue.length > validation.maxLength) return false;
    return true;
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <h3 className="text-lg font-semibold text-[#111827] mb-3">
        {component.title}
      </h3>

      {/* Text Input */}
      <div className="space-y-2">
        <Input
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          placeholder={component.data.placeholder || t("enterYourAnswer")}
          disabled={isCompleted}
          className="h-12 text-base"
        />
        
        {/* Character count */}
        {validation.maxLength && (
          <div className="text-xs text-[#6B7280] text-right">
            {textValue.length} / {validation.maxLength}
          </div>
        )}
      </div>

      {/* Submit button */}
      {!isCompleted && (
        <div className="pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!isValid() || isSubmitting}
            className="w-full bg-[#0055FF] hover:bg-blue-700 text-white"
          >
            {isSubmitting ? t("submitting") : t("continue")}
          </Button>
        </div>
      )}

      {/* Completed indicator */}
      {isCompleted && (
        <div className="flex items-center space-x-2 text-[#2ECC71] text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>{t("completed")}</span>
        </div>
      )}
    </div>
  );
} 