"use client";

import { useState } from "react";
import { OnboardingComponent, ComponentResponse } from "@/lib/types/onboarding.types";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";

interface IntroductionTemplateComponentProps {
  component: OnboardingComponent;
  onResponse: (response: ComponentResponse) => Promise<void>;
}

export function IntroductionTemplateComponent({
  component,
  onResponse,
}: IntroductionTemplateComponentProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);
  const [customText, setCustomText] = useState<string>(
    component.response?.textValue || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCompleted = component.isCompleted;
  // Use translations as defaults if component doesn't have data
  const template = component.data?.template || t("introductionTemplate");
  const suggestions = component.data?.suggestions || [
    t("suggestion1"),
    t("suggestion2"),
    t("suggestion3"),
  ];

  const handleTemplateUse = () => {
    setCustomText(template);
  };

  const handleSuggestionUse = (suggestion: string) => {
    setCustomText(suggestion);
  };

  const handleSubmit = async () => {
    if (!customText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onResponse({
        textValue: customText.trim(),
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Error submitting response:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <h3 className="text-lg font-semibold text-[#111827] mb-3">
        {component.title || t("introduceYourself")}
      </h3>

      {/* Template Example */}
      {template && (
        <div className="bg-[#F0F2F5] p-4 rounded-xl">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-semibold text-[#6B7280]">
              {t("exampleTemplate")}
            </h4>
            <button
              onClick={handleTemplateUse}
              disabled={isCompleted}
              className="flex items-center space-x-1 text-xs text-[#0055FF] hover:text-blue-700 disabled:opacity-50 transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>{t("useTemplate")}</span>
            </button>
          </div>
          <p className="text-sm text-[#111827] leading-relaxed italic">
            &ldquo;{template}&rdquo;
          </p>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-[#6B7280]">
            {t("suggestions")}:
          </h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionUse(suggestion)}
                disabled={isCompleted}
                className="px-3 py-1 text-xs bg-white border border-[#E5E7EB] rounded-full hover:border-[#0055FF] hover:text-[#0055FF] disabled:opacity-50 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text Area */}
      <div className="space-y-2">
        <textarea
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder={t("writeYourIntroduction")}
          disabled={isCompleted}
          className="w-full h-32 p-4 border border-[#E5E7EB] rounded-xl resize-none focus:outline-none focus:border-[#0055FF] disabled:bg-[#F9FAFB] disabled:opacity-50 transition-colors"
        />
        <div className="text-xs text-[#6B7280] text-right">
          {customText.length} {t("characters")}
        </div>
      </div>

      {/* Submit button */}
      {!isCompleted && (
        <div className="pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!customText.trim() || isSubmitting}
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