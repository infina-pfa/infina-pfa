"use client";

import { useState } from "react";
import {
  OnboardingComponent,
  ComponentResponse,
} from "@/lib/types/onboarding.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { useUserUpdateSWR } from "@/hooks/swr/use-user-update";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle } from "lucide-react";

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
  color: string;
  backgroundColor: string;
  features: string[];
  bestFor: string[];
  timeCommitment: string;
  trackingLevel: string;
}

export default function PhilosophySelection({
  component,
  onResponse,
}: PhilosophySelectionProps) {
  const { t } = useAppTranslation(["onboarding", "budgeting", "common"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPhilosophy, setSelectedPhilosophy] =
    useState<BudgetingPhilosophy | null>(
      component.response?.selectedPhilosophy || null
    );
  const [isCompleted, setIsCompleted] = useState(
    !!component.response?.selectedPhilosophy
  );

  // SWR hook for updating user profile
  const { updateBudgetingStyle } = useUserUpdateSWR({
    onSuccess: (user) => {
      console.log(
        "✅ Budgeting style updated successfully:",
        user.budgeting_style
      );
    },
  });

  const philosophyOptions: PhilosophyOption[] = [
    {
      id: "goal_focused",
      title: t("goalFocusedTitle", {
        ns: "budgeting",
        defaultValue: "Only review the free expense weekly",
      }),
      subtitle: t("goalFocusedSubtitle", {
        ns: "budgeting",
        defaultValue: "",
      }),
      description: t("goalFocusedDescription", {
        ns: "budgeting",
        defaultValue: "Only review the free expense weekly",
      }),
      color: "",
      backgroundColor: "",
      features: [],
      bestFor: [],
      timeCommitment: "",
      trackingLevel: "",
    },
    {
      id: "detail_tracker",
      title: t("detailTrackerTitle", {
        ns: "budgeting",
        defaultValue: "Refer note the spending in details",
      }),
      subtitle: t("detailTrackerSubtitle", {
        ns: "budgeting",
        defaultValue: "",
      }),
      description: t("detailTrackerDescription", {
        ns: "budgeting",
        defaultValue: "Refer note the spending in details",
      }),
      color: "",
      backgroundColor: "",
      features: [],
      bestFor: [],
      timeCommitment: "",
      trackingLevel: "",
    },
  ];

  const handlePhilosophySelect = (philosophy: BudgetingPhilosophy) => {
    setSelectedPhilosophy(philosophy);
  };

  const handleSubmit = async () => {
    if (isSubmitting || !selectedPhilosophy) return;

    try {
      setIsSubmitting(true);

      const selectedOption = philosophyOptions.find(
        (option) => option.id === selectedPhilosophy
      );

      // Save budgeting style to database first
      console.log("💾 Saving budgeting style to database:", selectedPhilosophy);
      const updatedUser = await updateBudgetingStyle(selectedPhilosophy);

      if (!updatedUser) {
        throw new Error("Failed to update budgeting style in database");
      }

      console.log(
        "✅ Budgeting style saved successfully:",
        updatedUser.budgeting_style
      );

      // Then send response to chat component
      // Create specific user message based on selection
      const userMessage =
        selectedPhilosophy === "goal_focused"
          ? t("goalFocusedTitle", {
              ns: "budgeting",
              defaultValue: "Only review the free expense weekly",
            })
          : t("detailTrackerTitle", {
              ns: "budgeting",
              defaultValue: "Refer note the spending in details",
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
        },
      });
      setIsCompleted(true);
    } catch (error) {
      console.error("Error submitting philosophy selection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedOption = philosophyOptions.find(
    (option) => option.id === selectedPhilosophy
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h3 className="text-base sm:text-lg font-semibold text-[#111827] font-nunito">
          {t("philosophySelectionTitle", {
            ns: "onboarding",
            defaultValue: "Choose Your Budgeting Philosophy",
          })}
        </h3>
        <p className="text-xs sm:text-sm text-[#6B7280]">
          {t("philosophySelectionSubtitle", {
            ns: "onboarding",
            defaultValue:
              "Select the approach that best fits your lifestyle and goals",
          })}
        </p>
      </div>

      {/* Philosophy Options */}
      <div className="space-y-2">
        {philosophyOptions.map((option) => {
          const isSelected = selectedPhilosophy === option.id;

          return (
            <div
              key={option.id}
              className={`p-3 rounded border cursor-pointer ${
                isSelected
                  ? "border-[#0055FF] bg-[#F8FAFF]"
                  : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
              } ${isCompleted ? "cursor-not-allowed" : ""}`}
              onClick={() => handlePhilosophySelect(option.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <CheckCircle className="w-5 h-5 text-[#0055FF]" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#D1D5DB]" />
                  )}
                </div>
                <p className="text-sm text-[#111827]">{option.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedOption && (
        <div className="bg-[#F6F7F9] rounded p-3 border border-[#E5E7EB]">
          <p className="text-sm text-[#4B5563]">
            Selected: {selectedOption.title}
          </p>
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
            : t("confirmPhilosophy", {
                ns: "budgeting",
                defaultValue: "Confirm My Philosophy",
              })}
        </Button>
      )}

      {/* Completion Status */}
      {isCompleted && (
        <div className="flex items-center justify-center space-x-2 text-[#2ECC71] text-sm font-semibold">
          <CheckCircle className="w-4 h-4" />
          <span>
            {t("philosophySelectionCompleted", {
              ns: "onboarding",
              defaultValue: "Philosophy selection completed!",
            })}
          </span>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-[#6B7280]">
          {t("philosophyChangeNote", {
            ns: "onboarding",
            defaultValue:
              "Don't worry - you can change your philosophy anytime in your account settings.",
          })}
        </p>
      </div>
    </div>
  );
}
