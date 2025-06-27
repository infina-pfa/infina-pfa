import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/error-handler";
import { useToast } from "@/hooks/use-toast";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const { success, error: showError } = useToast();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;

        setState({
          user: session?.user ?? null,
          loading: false,
          error: null,
        });
      } catch (error) {
        const appError = handleError(error);
        setState({
          user: null,
          loading: false,
          error: appError.message,
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setState({
        user: session?.user ?? null,
        loading: false,
        error: null,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setState({
        user: data.user,
        loading: false,
        error: null,
      });

      success('Welcome back!', 'Successfully signed in');
      return { user: data.user, error: null };
    } catch (error) {
      const appError = handleError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: appError.message,
      }));
      showError('Sign in failed', appError.message);
      return { user: null, error: appError.message };
    }
  };

  const signUp = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      setState({
        user: data.user,
        loading: false,
        error: null,
      });

      success('Account created!', 'Welcome to Infina PFA');
      return { user: data.user, error: null };
    } catch (error) {
      const appError = handleError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: appError.message,
      }));
      showError('Sign up failed', appError.message);
      return { user: null, error: appError.message };
    }
  };

  const signOut = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setState({
        user: null,
        loading: false,
        error: null,
      });
      
      success('Signed out successfully', 'See you next time!');
    } catch (error) {
      const appError = handleError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: appError.message,
      }));
      showError('Sign out failed', appError.message);
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
