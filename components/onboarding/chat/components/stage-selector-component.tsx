"use client";

import { useState } from "react";
import { OnboardingComponent, ComponentResponse, FinancialStage } from "@/lib/types/onboarding.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface StageSelectorComponentProps {
  component: OnboardingComponent;
  onResponse: (response: ComponentResponse) => Promise<void>;
}

interface StageOption {
  id: FinancialStage;
  title: string;
  description: string;
  criteria: string[];
}

export function StageSelectorComponent({
  component,
  onResponse,
}: StageSelectorComponentProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);
  const [selectedStage, setSelectedStage] = useState<FinancialStage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stages = (component.context.stages || []) as StageOption[];

  const handleStageSelect = (stageId: FinancialStage) => {
    setSelectedStage(stageId);
  };

  const handleSubmit = async () => {
    if (!selectedStage || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onResponse({
        selectedStage,
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Error submitting stage selection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 font-nunito">
      <div className="space-y-3">
        {stages.map((stage) => (
          <Card
            key={stage.id}
            className={`
              p-4 border-2 cursor-pointer transition-all duration-200 hover:shadow-md
              ${selectedStage === stage.id 
                ? 'border-[#0055FF] bg-[#0055FF]/5' 
                : 'border-[#E0E0E0] bg-white hover:border-[#0055FF]/30'
              }
            `}
            onClick={() => handleStageSelect(stage.id)}
          >
            <div className="flex items-start space-x-3">
              <div 
                className={`
                  w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors duration-200
                  ${selectedStage === stage.id 
                    ? 'border-[#0055FF] bg-[#0055FF]' 
                    : 'border-[#E0E0E0] bg-white'
                  }
                `}
              >
                {selectedStage === stage.id && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#111827] text-base mb-2">
                  {stage.title}
                </h3>
                <p className="text-[#6B7280] text-sm mb-3">
                  {stage.description}
                </p>
                <div className="space-y-1">
                  {stage.criteria.map((criterion, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0055FF] mt-2 flex-shrink-0"></div>
                      <span className="text-[#6B7280] text-xs">
                        {criterion}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!selectedStage || isSubmitting}
          className={`
            px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200
            ${selectedStage && !isSubmitting
              ? 'bg-[#0055FF] text-white hover:bg-[#0055FF]/90' 
              : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? t("submitting") : t("continue")}
        </Button>
      </div>
    </div>
  );
} 