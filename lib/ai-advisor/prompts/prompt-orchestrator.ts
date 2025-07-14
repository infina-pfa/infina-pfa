/**
 * Prompt Orchestrator - Selects appropriate stage-specific system prompt
 * Based on user's identified financial stage from decision tree
 */

import { generateDebtStagePrompt } from "./debt-stage-prompt";
import { generateStartSavingStagePrompt } from "./start-saving-stage-prompt";
import { generateStartInvestingStagePrompt } from "./start-investing-stage-prompt";
import { generateOnboardingSystemPrompt } from "./onboarding-system-prompt";

export type FinancialStage =
  | "debt"
  | "start_saving"
  | "start_investing"
  | "none";

interface PromptOrchestratorParams {
  userId: string;
  userProfile: Record<string, unknown>;
  conversationHistory: Array<{ role: string; content: string }>;
  currentStep: string;
}

/**
 * Main orchestrator function that selects the appropriate system prompt
 * based on user's identified financial stage
 */
export function generateStageSpecificPrompt(
  params: PromptOrchestratorParams
): string {
  const { userId, userProfile, conversationHistory, currentStep } = params;

  // Extract identified stage from user profile
  const identifiedStage = userProfile.identifiedStage as FinancialStage;

  console.log("🎯 Prompt Orchestrator - Stage Selection:", {
    userId,
    identifiedStage,
    hasStage: !!identifiedStage,
    profileKeys: Object.keys(userProfile),
    currentStep,
  });

  // If no stage identified yet, use the original onboarding prompt for stage identification
  if (!identifiedStage || identifiedStage === "none") {
    console.log("📝 Using onboarding prompt - stage not identified yet");
    return generateOnboardingSystemPrompt(
      userId,
      userProfile,
      conversationHistory,
      currentStep
    );
  }

  // Route to appropriate stage-specific prompt
  switch (identifiedStage) {
    case "debt":
      console.log("💳 Using DEBT stage prompt");
      return generateDebtStagePrompt(
        userId,
        userProfile,
        conversationHistory,
        currentStep
      );

    case "start_saving":
      console.log("💰 Using START SAVING stage prompt");
      return generateStartSavingStagePrompt(
        userId,
        userProfile,
        conversationHistory,
        currentStep
      );

    case "start_investing":
      console.log("📈 Using START INVESTING stage prompt");
      return generateStartInvestingStagePrompt(
        userId,
        userProfile,
        conversationHistory,
        currentStep
      );

    default:
      console.warn(
        "⚠️ Unknown stage, falling back to onboarding prompt:",
        identifiedStage
      );
      return generateOnboardingSystemPrompt(
        userId,
        userProfile,
        conversationHistory,
        currentStep
      );
  }
}

/**
 * Utility function to determine if user should be redirected to a different stage
 * based on their current financial situation
 */
export function validateStageCompatibility(
  currentStage: FinancialStage,
  userProfile: Record<string, unknown>
): {
  isValid: boolean;
  recommendedStage?: FinancialStage;
  reason?: string;
} {
  const hasHighInterestDebt = userProfile.hasHighInterestDebt as boolean;
  const hasEmergencyFund = userProfile.hasEmergencyFund as boolean;
  const emergencyFundMonths = userProfile.emergencyFundMonths as number;

  switch (currentStage) {
    case "start_saving":
      if (hasHighInterestDebt) {
        return {
          isValid: false,
          recommendedStage: "debt",
          reason: "User has high-interest debt that should be addressed first",
        };
      }
      return { isValid: true };

    case "start_investing":
      if (hasHighInterestDebt) {
        return {
          isValid: false,
          recommendedStage: "debt",
          reason:
            "User has high-interest debt that should be addressed before investing",
        };
      }
      if (
        !hasEmergencyFund ||
        (emergencyFundMonths && emergencyFundMonths < 3)
      ) {
        return {
          isValid: false,
          recommendedStage: "start_saving",
          reason: "User needs to establish emergency fund before investing",
        };
      }
      return { isValid: true };

    case "debt":
      if (!hasHighInterestDebt) {
        if (!hasEmergencyFund) {
          return {
            isValid: false,
            recommendedStage: "start_saving",
            reason: "User has cleared debt and should focus on emergency fund",
          };
        } else {
          return {
            isValid: false,
            recommendedStage: "start_investing",
            reason:
              "User has cleared debt and has emergency fund - ready for investing",
          };
        }
      }
      return { isValid: true };

    default:
      return { isValid: true };
  }
}

/**
 * Get stage progression information for user guidance
 */
export function getStageProgression(currentStage: FinancialStage): {
  currentStage: FinancialStage;
  nextStage?: FinancialStage;
  description: string;
  completionCriteria: string[];
} {
  switch (currentStage) {
    case "debt":
      return {
        currentStage: "debt",
        nextStage: "start_saving",
        description:
          "Eliminate high-interest debt to build financial foundation",
        completionCriteria: [
          "Pay off all credit card debt",
          "Eliminate BNPL and personal loans",
          "Keep only low-interest debt (mortgages, student loans)",
          "Establish debt-free spending habits",
        ],
      };

    case "start_saving":
      return {
        currentStage: "start_saving",
        nextStage: "start_investing",
        description: "Build emergency fund and establish saving habits",
        completionCriteria: [
          "Save 3-6 months of expenses as emergency fund",
          "Establish automated saving habits",
          "Have emergency fund in high-yield savings account",
          "Maintain consistent monthly surplus for investing",
        ],
      };

    case "start_investing":
      return {
        currentStage: "start_investing",
        nextStage: undefined,
        description: "Begin wealth building through diversified investing",
        completionCriteria: [
          "Open investment account with reputable broker",
          "Implement diversified portfolio allocation",
          "Set up systematic monthly investing",
          "Understand long-term investment principles",
        ],
      };

    default:
      return {
        currentStage: "none",
        nextStage: undefined,
        description: "Identify appropriate financial stage through assessment",
        completionCriteria: [
          "Complete financial situation assessment",
          "Determine current financial stage",
          "Understand stage-specific priorities",
        ],
      };
  }
}

/**
 * Helper function to log prompt selection for debugging
 */
export function logPromptSelection(
  userId: string,
  identifiedStage: FinancialStage,
  promptType: string,
  userProfile: Record<string, unknown>
): void {
  console.log("📊 Prompt Selection Log:", {
    timestamp: new Date().toISOString(),
    userId,
    identifiedStage,
    promptType,
    userProfileSnapshot: {
      hasStage: !!userProfile.identifiedStage,
      currentStageStep: userProfile.currentStageStep,
      hasHighInterestDebt: userProfile.hasHighInterestDebt,
      hasEmergencyFund: userProfile.hasEmergencyFund,
      profileKeys: Object.keys(userProfile),
    },
  });
}
