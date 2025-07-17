"use client";

import { useState } from "react";
import { OnboardingComponent, ComponentResponse } from "@/lib/types/onboarding.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { useUserUpdateSWR } from "@/hooks/swr/use-user-update";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Circle, 
  Target, 
  BarChart3, 
  Clock, 
  TrendingUp, 
  Eye,
  Calendar,
  Star
} from "lucide-react";

interface PhilosophySelectionProps {
  component: OnboardingComponent;
  onResponse: (response: ComponentResponse) => Promise<void>;
}

type BudgetingPhilosophy = "goal_focused" | "detail_tracker";

interface PhilosophyOption {
  id: BudgetingPhilosophy;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Target;
  color: string;
  backgroundColor: string;
  features: string[];
  bestFor: string[];
  timeCommitment: string;
  trackingLevel: string;
}

export default function PhilosophySelection({ 
  component, 
  onResponse 
}: PhilosophySelectionProps) {
  const { t } = useAppTranslation(["onboarding", "budgeting", "common"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPhilosophy, setSelectedPhilosophy] = useState<BudgetingPhilosophy | null>(
    component.response?.selectedPhilosophy || null
  );
  const [isCompleted, setIsCompleted] = useState(!!component.response?.selectedPhilosophy);
  
  // SWR hook for updating user profile
  const { updateBudgetingStyle } = useUserUpdateSWR({
    onSuccess: (user) => {
      console.log("✅ Budgeting style updated successfully:", user.budgeting_style);
    }
  });

  const philosophyOptions: PhilosophyOption[] = [
    {
      id: "goal_focused",
      title: t("goalFocusedTitle", { ns: "budgeting", defaultValue: "Pay Yourself First" }),
      subtitle: t("goalFocusedSubtitle", { ns: "budgeting", defaultValue: "Goal-Focused Approach" }),
      description: t("goalFocusedDescription", { 
        ns: "budgeting", 
        defaultValue: "Focus on consistently saving your target amount each month. Perfect for those who want to build wealth without detailed daily tracking." 
      }),
      icon: Target,
      color: "#0055FF",
      backgroundColor: "#E8F1FF",
      features: [
        t("goalFocusedFeature1", { ns: "budgeting", defaultValue: "Simple monthly savings goals" }),
        t("goalFocusedFeature2", { ns: "budgeting", defaultValue: "Weekly or monthly check-ins" }),
        t("goalFocusedFeature3", { ns: "budgeting", defaultValue: "Focus on emergency fund building" }),
        t("goalFocusedFeature4", { ns: "budgeting", defaultValue: "Minimal daily tracking required" }),
      ],
      bestFor: [
        t("goalFocusedBestFor1", { ns: "budgeting", defaultValue: "Busy professionals" }),
        t("goalFocusedBestFor2", { ns: "budgeting", defaultValue: "Those who hate detailed tracking" }),
        t("goalFocusedBestFor3", { ns: "budgeting", defaultValue: "Goal-oriented savers" }),
      ],
      timeCommitment: t("goalFocusedTime", { ns: "budgeting", defaultValue: "5-10 minutes per week" }),
      trackingLevel: t("goalFocusedTracking", { ns: "budgeting", defaultValue: "Basic" }),
    },
    {
      id: "detail_tracker",
      title: t("detailTrackerTitle", { ns: "budgeting", defaultValue: "Detail Tracker" }),
      subtitle: t("detailTrackerSubtitle", { ns: "budgeting", defaultValue: "Optimization-Focused Approach" }),
      description: t("detailTrackerDescription", { 
        ns: "budgeting", 
        defaultValue: "Track all expenses daily to analyze spending patterns and optimize your budget. Perfect for those who want to maximize savings through detailed analysis." 
      }),
      icon: BarChart3,
      color: "#2ECC71",
      backgroundColor: "#E8F8F0",
      features: [
        t("detailTrackerFeature1", { ns: "budgeting", defaultValue: "Daily expense tracking" }),
        t("detailTrackerFeature2", { ns: "budgeting", defaultValue: "Detailed spending analysis" }),
        t("detailTrackerFeature3", { ns: "budgeting", defaultValue: "Budget optimization recommendations" }),
        t("detailTrackerFeature4", { ns: "budgeting", defaultValue: "Category-wise insights" }),
      ],
      bestFor: [
        t("detailTrackerBestFor1", { ns: "budgeting", defaultValue: "Detail-oriented people" }),
        t("detailTrackerBestFor2", { ns: "budgeting", defaultValue: "Those who want to optimize spending" }),
        t("detailTrackerBestFor3", { ns: "budgeting", defaultValue: "Data-driven decision makers" }),
      ],
      timeCommitment: t("detailTrackerTime", { ns: "budgeting", defaultValue: "10-15 minutes daily" }),
      trackingLevel: t("detailTrackerTracking", { ns: "budgeting", defaultValue: "Comprehensive" }),
    },
  ];

  const handlePhilosophySelect = (philosophy: BudgetingPhilosophy) => {
    if (isCompleted) return;
    setSelectedPhilosophy(philosophy);
  };

  const handleSubmit = async () => {
    if (isSubmitting || isCompleted || !selectedPhilosophy) return;

    try {
      setIsSubmitting(true);
      
      const selectedOption = philosophyOptions.find(option => option.id === selectedPhilosophy);
      
      // Save budgeting style to database first
      console.log("💾 Saving budgeting style to database:", selectedPhilosophy);
      const updatedUser = await updateBudgetingStyle(selectedPhilosophy);
      
      if (!updatedUser) {
        throw new Error("Failed to update budgeting style in database");
      }
      
      console.log("✅ Budgeting style saved successfully:", updatedUser.budgeting_style);
      
      // Then send response to chat component
      // Create specific user message based on selection
      const userMessage = selectedPhilosophy === "goal_focused" 
        ? t("philosophySelectionGoalFocused", { 
            ns: "onboarding", 
            defaultValue: `Tôi đã chọn phương pháp ${selectedOption?.title} - phương pháp tập trung vào mục tiêu với cách tiếp cận đơn giản. Tôi thích theo dõi tổng quan với 3 danh mục ngân sách chính thay vì chi tiết từng khoản chi. Điều này phù hợp với lịch trình bận rộn của tôi và giúp tôi tập trung vào việc xây dựng quỹ dự phòng.` 
          })
        : t("philosophySelectionDetailTracker", { 
            ns: "onboarding", 
            defaultValue: `Tôi đã chọn phương pháp ${selectedOption?.title} - phương pháp theo dõi chi tiết. Tôi muốn phân loại và theo dõi từng khoản chi tiêu để hiểu rõ dòng tiền của mình. Điều này sẽ giúp tôi tối ưu hóa ngân sách và tìm cơ hội tiết kiệm thêm.` 
          });

      await onResponse({
        selectedPhilosophy,
        budgetingStyle: selectedPhilosophy, // This matches what was saved to database
        completedAt: new Date(),
        userMessage,
        philosophyDetails: {
          id: selectedPhilosophy,
          title: selectedOption?.title || "",
          description: selectedOption?.description || "",
          features: selectedOption?.features,
          timeCommitment: selectedOption?.timeCommitment,
        }
      });
      setIsCompleted(true);
    } catch (error) {
      console.error("Error submitting philosophy selection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedOption = philosophyOptions.find(option => option.id === selectedPhilosophy);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h3 className="text-base sm:text-lg font-semibold text-[#111827] font-nunito">
          {t("philosophySelectionTitle", { 
            ns: "onboarding", 
            defaultValue: "Choose Your Budgeting Philosophy" 
          })}
        </h3>
        <p className="text-xs sm:text-sm text-[#6B7280]">
          {t("philosophySelectionSubtitle", { 
            ns: "onboarding", 
            defaultValue: "Select the approach that best fits your lifestyle and goals" 
          })}
        </p>
      </div>

      {/* Philosophy Options */}
      <div className="space-y-3 sm:space-y-4">
        {philosophyOptions.map((option) => {
          const IconComponent = option.icon;
          const isSelected = selectedPhilosophy === option.id;
          
          return (
            <div
              key={option.id}
              className={`relative p-3 sm:p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? "border-[#0055FF] bg-[#F8FAFF] shadow-sm" 
                  : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:shadow-sm"
              } ${isCompleted ? "cursor-not-allowed" : ""}`}
              onClick={() => handlePhilosophySelect(option.id)}
            >
              {/* Selection Indicator */}
              <div className="absolute top-4 right-4">
                {isSelected ? (
                  <CheckCircle className="w-6 h-6 text-[#0055FF]" />
                ) : (
                  <Circle className="w-6 h-6 text-[#D1D5DB]" />
                )}
              </div>

              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div 
                  className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: option.backgroundColor }}
                >
                  <IconComponent 
                    className="w-6 h-6 sm:w-7 sm:h-7" 
                    style={{ color: option.color }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="mb-3">
                    <h4 className="font-semibold text-[#111827] font-nunito text-base sm:text-lg">
                      {option.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#6B7280] font-medium">
                      {option.subtitle}
                    </p>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-[#4B5563] mb-3 sm:mb-4 leading-relaxed">
                    {option.description}
                  </p>

                  {/* Features */}
                  <div className="mb-4">
                    <h5 className="font-semibold text-[#111827] font-nunito text-xs sm:text-sm mb-2">
                      {t("keyFeatures", { ns: "common", defaultValue: "Key Features:" })}
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {option.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Star className="w-3 h-3 text-[#FF9800] flex-shrink-0" />
                          <span className="text-[10px] sm:text-xs text-[#4B5563]">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Best For */}
                  <div className="mb-4">
                    <h5 className="font-semibold text-[#111827] font-nunito text-xs sm:text-sm mb-2">
                      {t("bestFor", { ns: "common", defaultValue: "Best For:" })}
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {option.bestFor.map((item, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-[#F3F4F6] text-[#4B5563] text-[10px] sm:text-xs rounded-full"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Time Commitment & Tracking Level */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-[#6B7280]" />
                      <div>
                        <p className="text-[10px] sm:text-xs text-[#6B7280]">
                          {t("timeCommitment", { ns: "common", defaultValue: "Time Commitment" })}
                        </p>
                        <p className="text-[10px] sm:text-xs font-semibold text-[#111827]">
                          {option.timeCommitment}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-[#6B7280]" />
                      <div>
                        <p className="text-[10px] sm:text-xs text-[#6B7280]">
                          {t("trackingLevel", { ns: "common", defaultValue: "Tracking Level" })}
                        </p>
                        <p className="text-[10px] sm:text-xs font-semibold text-[#111827]">
                          {option.trackingLevel}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedOption && (
        <div className="bg-[#F6F7F9] rounded-xl p-3 sm:p-4 border border-[#E5E7EB]">
          <div className="flex items-start space-x-3">
            <div 
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: selectedOption.backgroundColor }}
            >
              <selectedOption.icon 
                className="w-5 h-5" 
                style={{ color: selectedOption.color }}
              />
            </div>
            <div>
              <h4 className="font-semibold text-[#111827] font-nunito mb-1 text-sm sm:text-base">
                {t("youSelected", { ns: "common", defaultValue: "You selected:" })} {selectedOption.title}
              </h4>
              <p className="text-xs sm:text-sm text-[#4B5563] mb-2">
                {t("aiWillTailor", { 
                  ns: "onboarding", 
                  defaultValue: "I'll tailor my advice and features to match your chosen approach. You can change this later in your settings." 
                })}
              </p>
              <div className="flex items-center space-x-4 text-xs text-[#6B7280]">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{selectedOption.timeCommitment}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{selectedOption.trackingLevel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {!isCompleted && (
        <Button
          onClick={handleSubmit}
          disabled={!selectedPhilosophy || isSubmitting}
          className="w-full bg-[#0055FF] hover:bg-[#0044DD] text-white font-nunito disabled:bg-[#9CA3AF] disabled:cursor-not-allowed h-12 sm:h-10 min-h-[48px] sm:min-h-0 text-sm sm:text-base"
        >
          {isSubmitting 
            ? t("submitting", { ns: "common", defaultValue: "Submitting..." })
            : t("confirmPhilosophy", { ns: "budgeting", defaultValue: "Confirm My Philosophy" })
          }
        </Button>
      )}

      {/* Completion Status */}
      {isCompleted && (
        <div className="flex items-center justify-center space-x-2 text-[#2ECC71] text-sm font-semibold">
          <CheckCircle className="w-4 h-4" />
          <span>
            {t("philosophySelectionCompleted", { 
              ns: "onboarding", 
              defaultValue: "Philosophy selection completed!" 
            })}
          </span>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-[#6B7280]">
          {t("philosophyChangeNote", { 
            ns: "onboarding", 
            defaultValue: "Don't worry - you can change your philosophy anytime in your account settings." 
          })}
        </p>
      </div>
    </div>
  );
}