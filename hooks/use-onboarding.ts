import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/lib/services/user.service";
import { CreateUserRequest } from "@/lib/types/user.types";

export type OnboardingStep = "welcome" | "name" | "loading";

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
    if (state.step === "welcome") {
      setState(prev => ({
        ...prev,
        step: "name",
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

      // Success - show success message and navigate
      success(t("successTitle"), t("successSubtitle"));
      
      // Navigate to chat immediately
      router.push("/chat");

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