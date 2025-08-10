import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/error-handler";
import {
  AuthUser,
  SignInRequest,
  SignUpRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/lib/types/auth.types";

// Type for translation function
type TranslationFunction = (key: string) => string;

export const authService = {
  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
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
  async signIn(
    credentials: SignInRequest,
    t?: TranslationFunction
  ): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword(
        credentials
      );

      if (error) throw error;

      return {
        user: data.user as AuthUser,
        error: null,
      };
    } catch (error) {
      const appError = handleError(error, t);
      return {
        user: null,
        error: appError.message,
      };
    }
  },

  /**
   * Sign up with email and password
   */
  async signUp(
    credentials: SignUpRequest,
    t?: TranslationFunction
  ): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        ...credentials,
        options: {
          emailRedirectTo: `${window.location.origin}/sign-in`,
        },
      });

      if (error) throw error;

      return {
        user: data.user as AuthUser,
        error: null,
      };
    } catch (error) {
      const appError = handleError(error, t);
      return {
        user: null,
        error: appError.message,
      };
    }
  },

  /**
   * Send password reset email
   */
  async forgotPassword(
    request: ForgotPasswordRequest,
    t?: TranslationFunction
  ): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        request.email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (error) throw error;

      return { error: null };
    } catch (error) {
      const appError = handleError(error, t);
      return { error: appError.message };
    }
  },

  /**
   * Resend email verification
   */
  async resendEmailVerification(
    email: string,
    t?: TranslationFunction
  ): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      const appError = handleError(error, t);
      return { error: appError.message };
    }
  },

  /**
   * Reset password with new password
   */
  async resetPassword(
    request: ResetPasswordRequest,
    t?: TranslationFunction
  ): Promise<{ error: string | null }> {
    try {
      // Validate passwords match
      if (request.password !== request.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Validate password strength
      if (request.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      const { error } = await supabase.auth.updateUser({
        password: request.password,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      const appError = handleError(error, t);
      return { error: appError.message };
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(t?: TranslationFunction): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const appError = handleError(error, t);
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
