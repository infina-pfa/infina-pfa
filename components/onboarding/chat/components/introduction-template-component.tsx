"use client";

import { useState, useEffect } from "react";
import { OnboardingComponent, ComponentResponse } from "@/lib/types/onboarding.types";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";
import { Input } from "@/components/ui/input";

interface IntroductionTemplateComponentProps {
  component: OnboardingComponent;
  onResponse: (response: ComponentResponse) => Promise<void>;
}

interface TemplateFields {
  name: string;
  age: string;
  location: string;
  job: string;
  income: string;
  goal: string;
}

export function IntroductionTemplateComponent({
  component,
  onResponse,
}: IntroductionTemplateComponentProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);
  const [templateFields, setTemplateFields] = useState<TemplateFields>({
    name: "",
    age: "",
    location: "",
    job: "",
    income: "",
    goal: "",
  });
  const [generatedText, setGeneratedText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCompleted = component.isCompleted;
  
  // Load previous response if exists
  useEffect(() => {
    if (component.response?.textValue && !isCompleted) {
      setGeneratedText(component.response.textValue);
    }
  }, [component.response, isCompleted]);

  // Generate text from template when fields change
  useEffect(() => {
    if (templateFields.name || templateFields.age || templateFields.location || 
        templateFields.job || templateFields.income || templateFields.goal) {
      const templateText = t("templateText");
      const generated = templateText
        .replace("{name}", templateFields.name || `{${t("nameFieldLabel")}}`)
        .replace("{age}", templateFields.age || `{${t("ageFieldLabel")}}`)
        .replace("{location}", templateFields.location || `{${t("locationFieldLabel")}}`)
        .replace("{job}", templateFields.job || `{${t("jobFieldLabel")}}`)
        .replace("{income}", templateFields.income || `{${t("incomeFieldLabel")}}`)
        .replace("{goal}", templateFields.goal || `{${t("goalFieldLabel")}}`);
      setGeneratedText(generated);
    }
  }, [templateFields, t]);

  const handleFieldChange = (field: keyof TemplateFields, value: string) => {
    setTemplateFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateUse = () => {
    const template = component.context?.template || t("introductionTemplate");
    setGeneratedText(template);
  };

  const handleSubmit = async () => {
    if (!generatedText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onResponse({
        textValue: generatedText.trim(),
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Error submitting response:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = Object.values(templateFields).every(field => field.trim() !== "");

  return (
    <div className="space-y-4">
      {/* Title */}
      <h3 className="text-lg font-semibold text-[#111827] mb-3">
        {component.title || t("introduceYourself")}
      </h3>

      {/* Template Example */}
      {component.context?.template && (
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
            &ldquo;{component.context.template}&rdquo;
          </p>
        </div>
      )}

      {/* Template Fill-in Form */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-[#6B7280]">
          {t("templateFillInBlanks")}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">
              {t("nameFieldLabel")}
            </label>
            <Input
              value={templateFields.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              placeholder={t("templateNamePlaceholder")}
              disabled={isCompleted}
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">
              {t("ageFieldLabel")}
            </label>
            <Input
              value={templateFields.age}
              onChange={(e) => handleFieldChange("age", e.target.value)}
              placeholder={t("templateAgePlaceholder")}
              disabled={isCompleted}
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">
              {t("locationFieldLabel")}
            </label>
            <Input
              value={templateFields.location}
              onChange={(e) => handleFieldChange("location", e.target.value)}
              placeholder={t("templateLocationPlaceholder")}
              disabled={isCompleted}
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">
              {t("jobFieldLabel")}
            </label>
            <Input
              value={templateFields.job}
              onChange={(e) => handleFieldChange("job", e.target.value)}
              placeholder={t("templateJobPlaceholder")}
              disabled={isCompleted}
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">
              {t("incomeFieldLabel")}
            </label>
            <Input
              value={templateFields.income}
              onChange={(e) => handleFieldChange("income", e.target.value)}
              placeholder={t("templateIncomePlaceholder")}
              disabled={isCompleted}
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">
              {t("goalFieldLabel")}
            </label>
            <Input
              value={templateFields.goal}
              onChange={(e) => handleFieldChange("goal", e.target.value)}
              placeholder={t("templateGoalPlaceholder")}
              disabled={isCompleted}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Generated Text Preview */}
      {generatedText && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-[#6B7280]">
            {t("preview")}:
          </h4>
          <div className="bg-[#F9FAFB] p-3 rounded-xl border border-[#E5E7EB]">
            <p className="text-sm text-[#111827] leading-relaxed">
              {generatedText}
            </p>
          </div>
          <div className="text-xs text-[#6B7280] text-right">
            {generatedText.length} {t("characters")}
          </div>
        </div>
      )}

      {/* Submit button */}
      {!isCompleted && (
        <div className="pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
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