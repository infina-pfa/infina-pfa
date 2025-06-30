import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { authService } from "@/lib/services/auth.service";
import { AuthState, AuthUser } from "@/lib/types/auth.types";

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const { success, error: showError } = useToast();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const user = await authService.getCurrentUser();
        setState({
          user,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : t('errorUnknownError'),
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((user: AuthUser | null) => {
      setState({
        user,
        loading: false,
        error: null,
      });
    });

    return () => subscription.unsubscribe();
  }, [t]);

  const signIn = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const result = await authService.signIn({ email, password }, t);
    
    if (result.error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: result.error,
      }));
      showError(t('signInFailed'), result.error);
      return { user: null, error: result.error };
    }

    setState({
      user: result.user,
      loading: false,
      error: null,
    });

    success(t('welcomeBack'), t('signInSuccess'));
    return { user: result.user, error: null };
  };

  const signUp = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const result = await authService.signUp({ email, password }, t);
    
    if (result.error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: result.error,
      }));
      showError(t('signUpFailed'), result.error);
      return { user: null, error: result.error };
    }

    setState({
      user: result.user,
      loading: false,
      error: null,
    });

    success(t('accountCreated'), t('welcomeToInfina'));
    return { user: result.user, error: null };
  };

  const forgotPassword = async (email: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const result = await authService.forgotPassword({ email }, t);
    
    setState(prev => ({
      ...prev,
      loading: false,
      error: result.error,
    }));

    if (result.error) {
      showError(t('resetEmailFailed'), result.error);
      return { success: false, error: result.error };
    }

    success(t('resetEmailSent'), t('checkEmailForInstructions'));
    return { success: true, error: null };
  };

  const resetPassword = async (password: string, confirmPassword: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const result = await authService.resetPassword({ password, confirmPassword }, t);
    
    setState(prev => ({
      ...prev,
      loading: false,
      error: result.error,
    }));

    if (result.error) {
      showError(t('resetPasswordFailed'), result.error);
      return { success: false, error: result.error };
    }

    success(t('passwordResetSuccess'), t('signInWithNewPassword'));
    return { success: true, error: null };
  };

  const signOut = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await authService.signOut(t);
      
      setState({
        user: null,
        loading: false,
        error: null,
      });
      
      success(t('signOutSuccess'), t('seeYouNextTime'));
      
      // Redirect to sign-in page after successful sign out
      router.push('/auth/sign-in');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('errorUnknownError');
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      showError(t('signOutFailed'), errorMessage);
    }
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    resetPassword,
  };
};
