import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/lib/services/user.service";
import { CreateUserRequest } from "@/lib/types/user.types";

export type OnboardingStep = "welcome" | "introduction" | "name" | "loading" | "success";

interface OnboardingState {
  step: OnboardingStep;
  name: string;
  loading: boolean;
  error: string | null;
}

export const useOnboarding = (userId: string) => {
  const [state, setState] = useState<OnboardingState>({
    step: "welcome",
    name: "",
    loading: false,
    error: null,
  });

  const { t } = useTranslation();
  const { success, error: showError } = useToast();
  const router = useRouter();

  const nextStep = () => {
    const steps: OnboardingStep[] = ["welcome", "introduction", "name", "loading", "success"];
    const currentIndex = steps.indexOf(state.step);
    if (currentIndex < steps.length - 1) {
      setState(prev => ({
        ...prev,
        step: steps[currentIndex + 1],
        error: null,
      }));
    }
  };

  const updateName = (name: string) => {
    setState(prev => ({
      ...prev,
      name,
      error: null,
    }));
  };

  const validateName = (name: string): string | null => {
    if (!name.trim()) {
      return t("nameRequired");
    }
    if (name.trim().length < 2) {
      return t("nameInvalid");
    }
    return null;
  };

  const createUser = async () => {
    // Validate name first
    const nameError = validateName(state.name);
    if (nameError) {
      setState(prev => ({
        ...prev,
        error: nameError,
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      step: "loading",
      loading: true,
      error: null,
    }));

    try {
      const request: CreateUserRequest = {
        name: state.name.trim(),
      };

      const result = await userService.createUser(userId, request, t);

      if (result.error) {
        setState(prev => ({
          ...prev,
          step: "name",
          loading: false,
          error: result.error,
        }));
        showError(t("createUserFailed"), result.error);
        return;
      }

      // Success - show success step briefly then navigate
      setState(prev => ({
        ...prev,
        step: "success",
        loading: false,
        error: null,
      }));

      success(t("successTitle"), t("successSubtitle"));
      
      // Wait a moment to show success message, then navigate
      setTimeout(() => {
        router.push("/chat");
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("unexpectedError");
      setState(prev => ({
        ...prev,
        step: "name",
        loading: false,
        error: errorMessage,
      }));
      showError(t("createUserFailed"), errorMessage);
    }
  };

  const retryCreation = () => {
    setState(prev => ({
      ...prev,
      step: "name",
      error: null,
    }));
  };

  return {
    step: state.step,
    name: state.name,
    loading: state.loading,
    error: state.error,
    nextStep,
    updateName,
    createUser,
    retryCreation,
    validateName,
  };
}; 