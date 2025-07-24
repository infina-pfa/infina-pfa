"use client";

import { useState } from "react";
import {
  OnboardingComponent,
  ComponentResponse,
  EducationContent,
} from "@/lib/types/onboarding.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { VideoMessage } from "@/components/chat";

interface EducationContentComponentProps {
  component: OnboardingComponent;
  onResponse: (response: ComponentResponse) => Promise<void>;
}

export function EducationContentComponent({
  component,
  onResponse,
}: EducationContentComponentProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);

  const educationContent = component.context
    .educationContent as EducationContent;
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
        textValue: t("educationContentCompleted"),
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Error completing education:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-nunito w-full max-w-2xl mx-auto px-2 sm:px-0">
      {/* Content Header - Compact for Mobile */}
      <div className="text-center space-y-2 sm:space-y-3">
        <div className="inline-block">
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#0055FF]/10 rounded-full">
            <span className="text-xs sm:text-sm font-medium text-[#0055FF] uppercase tracking-wide">
              {educationContent.type === "video" ? "Video Learning" : "Educational Content"}
            </span>
          </div>
        </div>
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#111827] leading-tight px-2">
          {educationContent.title}
        </h3>
      </div>

      {/* Video Content - Responsive */}
      {educationContent.type === "video" && educationContent.videoUrl && (
        <div className="relative -mx-2 sm:mx-0">
          <VideoMessage videoURL={educationContent.videoUrl} />
        </div>
      )}

      {/* Content Description - Compact */}
      <div className="bg-[#F6F7F9] rounded-lg sm:rounded-xl p-4 sm:p-5">
        <div className="text-[#374151] leading-relaxed text-sm sm:text-base whitespace-pre-line">
          {educationContent.content}
        </div>
      </div>

      {/* Related Actions - Mobile Optimized */}
      {educationContent.relatedActions &&
        educationContent.relatedActions.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center px-2">
              <h4 className="text-base sm:text-lg font-semibold text-[#111827] mb-1">
                {t("whatWouldYouLikeToKnow")}
              </h4>
              <p className="text-xs sm:text-sm text-[#6B7280]">
                Chọn một tùy chọn để tiếp tục
              </p>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {educationContent.relatedActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleActionClick(action)}
                  disabled={isSubmitting}
                  className={`
                    group relative w-full text-left p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300
                    ${
                      selectedAction === action
                        ? "bg-[#0055FF] shadow-lg shadow-[#0055FF]/20"
                        : "bg-white hover:bg-[#0055FF]/5 hover:shadow-md"
                    }
                    ${
                      isSubmitting
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-2">
                      <span className={`
                        font-medium text-sm sm:text-base transition-colors duration-300 leading-tight
                        ${
                          selectedAction === action
                            ? "text-white"
                            : "text-[#111827] group-hover:text-[#0055FF]"
                        }
                      `}>
                        {action}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      {selectedAction === action && isSubmitting ? (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : selectedAction === action ? (
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      ) : (
                        <ArrowRight className={`
                          w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 group-hover:translate-x-1
                          ${selectedAction === action ? "text-white" : "text-[#6B7280] group-hover:text-[#0055FF]"}
                        `} />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

      {/* Continue Button - Mobile Optimized */}
      <div className="flex justify-center pt-2 sm:pt-4">
        <Button
          onClick={handleContinue}
          disabled={isSubmitting}
          className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-[#0055FF] text-white hover:bg-[#0055FF]/90 text-sm sm:text-base font-medium rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#0055FF]/20"
        >
          <span className="flex items-center justify-center space-x-2">
            <span>{isSubmitting ? t("submitting") : t("continueToNextStep")}</span>
            {!isSubmitting && (
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            )}
          </span>
        </Button>
      </div>

      {/* Educational Tip - Compact Mobile Design */}
      <div className="bg-gradient-to-r from-[#0055FF]/5 to-[#2ECC71]/5 rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-3 sm:border-l-4 border-[#0055FF]">
        <div className="flex items-start space-x-2 sm:space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#FFC107] rounded-full flex items-center justify-center">
              <span className="text-xs sm:text-sm">💡</span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h5 className="font-semibold text-[#111827] mb-1 text-sm sm:text-base">Mẹo học tập</h5>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
              {t("educationTip")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
