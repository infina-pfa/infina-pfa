import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/error-handler";
import { AuthUser, SignInRequest, SignUpRequest, AuthResponse } from "@/lib/types/auth.types";

export const authService = {
  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user as AuthUser | null;
    } catch (error) {
      const appError = handleError(error);
      throw new Error(appError.message);
    }
  },

  /**
   * Sign in with email and password
   */
  async signIn(credentials: SignInRequest): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      
      if (error) throw error;
      
      return {
        user: data.user as AuthUser,
        error: null,
      };
    } catch (error) {
      const appError = handleError(error);
      return {
        user: null,
        error: appError.message,
      };
    }
  },

  /**
   * Sign up with email and password
   */
  async signUp(credentials: SignUpRequest): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp(credentials);
      
      if (error) throw error;
      
      return {
        user: data.user as AuthUser,
        error: null,
      };
    } catch (error) {
      const appError = handleError(error);
      return {
        user: null,
        error: appError.message,
      };
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const appError = handleError(error);
      throw new Error(appError.message);
    }
  },

  /**
   * Listen to auth state changes
   * Note: This method returns the subscription directly since it's a special case
   * that needs to be handled in the hook for real-time updates
   */
  onAuthStateChange: (callback: (user: AuthUser | null) => void) => {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      callback(session?.user as AuthUser | null);
    });
  },
}; 