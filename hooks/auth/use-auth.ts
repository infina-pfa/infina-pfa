import { ApiError } from "@/lib/api/type";
import { authService } from "@/lib/services/auth.service";
import { AuthState, AuthUser } from "@/lib/types/auth.types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const user = await authService.getCurrentUser();
      setState({
        user,
        loading: false,
      });
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange((user: AuthUser | null) => {
      setState({
        user,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await authService.signIn({ email, password });

      setState({
        user: null,
        loading: false,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(t(error.errorCode as string));
      } else {
        toast.error(t("unexpectedError"));
      }
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await authService.signUp({ email, password });

      setState({
        user: null,
        loading: false,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(t(error.errorCode as string));
      } else {
        toast.error(t("unexpectedError"));
      }
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await authService.forgotPassword({ email });
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(t(error.errorCode as string));
      } else {
        toast.error(t("unexpectedError"));
      }
    }
  };

  const resetPassword = async (password: string, confirmPassword: string) => {
    try {
      await authService.resetPassword({
        password,
        confirmPassword,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(t(error.errorCode as string));
      } else {
        toast.error(t("unexpectedError"));
      }
    }
  };

  const signOut = async () => {
    await authService.signOut();

    setState({
      user: null,
      loading: false,
    });

    // Redirect to sign-in page after successful sign out
    router.push("/auth/sign-in");
  };

  const resendEmailVerification = async (email: string): Promise<void> => {
    try {
      await authService.resendEmailVerification(email);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(t(error.errorCode as string));
      } else {
        toast.error(t("unexpectedError"));
      }
    }
  };

  return {
    user: state.user,
    loading: state.loading,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    resetPassword,
    resendEmailVerification,
  };
};
