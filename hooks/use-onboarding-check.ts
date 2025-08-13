import { onboardingService } from "@/lib/services";
import { useEffect, useState } from "react";

interface OnboardingCheckState {
  isLoading: boolean;
  needsOnboarding: boolean;
  error: string | null;
}

export const useOnboardingCheck = () => {
  const [state, setState] = useState<OnboardingCheckState>({
    isLoading: true,
    needsOnboarding: false,
    error: null,
  });

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await onboardingService.getOnboardingProfile();

      // Check if user has completed onboarding
      const needsOnboarding = !response.completedAt;

      setState({
        isLoading: false,
        needsOnboarding,
        error: null,
      });
    } catch (error) {
      setState({
        isLoading: false,
        needsOnboarding: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check onboarding status",
      });
    }
  };

  return {
    ...state,
    recheckStatus: checkOnboardingStatus,
  };
};
