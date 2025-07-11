"use client";

import { useState } from "react";
import { OnboardingComponent, ComponentResponse, EducationContent } from "@/lib/types/onboarding.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, FileText, ExternalLink, CheckCircle } from "lucide-react";

interface EducationContentComponentProps {
  component: OnboardingComponent;
  onResponse: (response: ComponentResponse) => Promise<void>;
}

export function EducationContentComponent({
  component,
  onResponse,
}: EducationContentComponentProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);
  
  const educationContent = component.context.educationContent as EducationContent;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleActionClick = async (action: string) => {
    if (isSubmitting) return;

    setSelectedAction(action);
    setIsSubmitting(true);
    
    try {
      await onResponse({
        educationCompleted: true,
        textValue: action, // Pass the selected action
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Error submitting education action:", error);
    } finally {
      setIsSubmitting(false);
      setSelectedAction(null);
    }
  };

  const handleContinue = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onResponse({
        educationCompleted: true,
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Error completing education:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-nunito">
      {/* Content Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-[#0055FF] rounded-full flex items-center justify-center mx-auto">
          {educationContent.type === "video" ? (
            <Play className="text-white" size={24} />
          ) : (
            <FileText className="text-white" size={24} />
          )}
        </div>
        <h3 className="text-xl font-bold text-[#111827]">
          {educationContent.title}
        </h3>
      </div>

      {/* Video Content */}
      {educationContent.type === "video" && educationContent.videoUrl && (
        <Card className="p-6 bg-gradient-to-br from-[#0055FF]/5 to-[#0055FF]/10 border-[#0055FF]/20">
          <div className="space-y-4">
            <div className="aspect-video bg-[#000] rounded-lg flex items-center justify-center relative overflow-hidden">
              {/* Placeholder for video player */}
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <Play className="text-white" size={32} />
                </div>
                <div className="text-white">
                  <p className="font-medium">{educationContent.title}</p>
                  <p className="text-sm opacity-80">{t("clickToWatch")}</p>
                </div>
              </div>
              
              {/* Overlay for external link */}
              <a
                href={educationContent.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/60 transition-colors group"
              >
                <div className="text-white text-center space-y-2">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Play size={24} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{t("watchOnYouTube")}</span>
                    <ExternalLink size={14} />
                  </div>
                </div>
              </a>
            </div>
          </div>
        </Card>
      )}

      {/* Text Content */}
      <Card className="p-6">
        <div className="prose prose-sm max-w-none">
          <div className="text-[#374151] leading-relaxed whitespace-pre-line">
            {educationContent.content}
          </div>
        </div>
      </Card>

      {/* Related Actions */}
      {educationContent.relatedActions && educationContent.relatedActions.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-[#111827]">
            {t("whatWouldYouLikeToKnow")}
          </h4>
          
          <div className="space-y-3">
            {educationContent.relatedActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleActionClick(action)}
                disabled={isSubmitting}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                  ${selectedAction === action
                    ? 'border-[#0055FF] bg-[#0055FF]/5' 
                    : 'border-[#E0E0E0] bg-white hover:border-[#0055FF]/30 hover:bg-[#0055FF]/5'
                  }
                  ${isSubmitting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#111827] text-sm">
                    {action}
                  </span>
                  {selectedAction === action && isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <div className={`
                      w-5 h-5 rounded-full border-2 transition-colors duration-200
                      ${selectedAction === action 
                        ? 'border-[#0055FF] bg-[#0055FF]' 
                        : 'border-[#E0E0E0] bg-white'
                      }
                    `}>
                      {selectedAction === action && (
                        <CheckCircle className="w-full h-full text-white" />
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleContinue}
          disabled={isSubmitting}
          className="px-8 py-3 bg-[#0055FF] text-white hover:bg-[#0055FF]/90 text-base font-medium"
        >
          {isSubmitting ? t("submitting") : t("continueToNextStep")}
        </Button>
      </div>

      {/* Additional Tips */}
      <div className="bg-[#F6F7F9] p-4 rounded-lg">
        <p className="text-sm text-[#6B7280] text-center">
          💡 {t("educationTip")}
        </p>
      </div>
    </div>
  );
} 