import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth.service";
import { AuthState, AuthUser } from "@/lib/types/auth.types";

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const { success, error: showError } = useToast();
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
          error: error instanceof Error ? error.message : 'Failed to get user',
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
  }, []);

  const signIn = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const result = await authService.signIn({ email, password });
    
    if (result.error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: result.error,
      }));
      showError('Sign in failed', result.error);
      return { user: null, error: result.error };
    }

    setState({
      user: result.user,
      loading: false,
      error: null,
    });

    success('Welcome back!', 'Successfully signed in');
    return { user: result.user, error: null };
  };

  const signUp = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const result = await authService.signUp({ email, password });
    
    if (result.error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: result.error,
      }));
      showError('Sign up failed', result.error);
      return { user: null, error: result.error };
    }

    setState({
      user: result.user,
      loading: false,
      error: null,
    });

    success('Account created!', 'Welcome to Infina PFA');
    return { user: result.user, error: null };
  };

  const signOut = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await authService.signOut();
      
      setState({
        user: null,
        loading: false,
        error: null,
      });
      
      success('Signed out successfully', 'See you next time!');
      
      // Redirect to sign-in page after successful sign out
      router.push('/auth/sign-in');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      showError('Sign out failed', errorMessage);
    }
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signIn,
    signUp,
    signOut,
  };
};
