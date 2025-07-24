import { useState, useEffect } from "react";
import { userService } from "@/lib/services/user.service";
import { FinancialStage, UserProfile } from "@/lib/types/user.types";

interface OnboardingCheckState {
  isLoading: boolean;
  needsOnboarding: boolean;
  userProfile: UserProfile | null;
  error: string | null;
}

export const useOnboardingCheck = () => {
  const [state, setState] = useState<OnboardingCheckState>({
    isLoading: true,
    needsOnboarding: false,
    userProfile: null,
    error: null,
  });

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await userService.getUserProfile();

      if (response.error) {
        // If no profile exists, user needs onboarding
        setState({
          isLoading: false,
          needsOnboarding: true,
          userProfile: null,
          error: null,
        });
        return;
      }

      // Check if user has completed onboarding
      const needsOnboarding = !response.user?.onboarding_completed_at;

      setState({
        isLoading: false,
        needsOnboarding,
        userProfile: response.user,
        error: null,
      });
    } catch (error) {
      setState({
        isLoading: false,
        needsOnboarding: false,
        userProfile: null,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check onboarding status",
      });
    }
  };

  const markOnboardingComplete = (financialStage: FinancialStage) => {
    setState((prev) => ({
      ...prev,
      needsOnboarding: false,
      userProfile: prev.userProfile
        ? {
            ...prev.userProfile,
            onboarding_completed_at: new Date().toISOString(),
            financial_stage: financialStage,
          }
        : null,
    }));
  };

  return {
    ...state,
    markOnboardingComplete,
    recheckStatus: checkOnboardingStatus,
  };
};
