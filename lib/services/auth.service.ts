import { supabase } from "@/lib/supabase";
import {
  AuthResponse,
  AuthUser,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SignInRequest,
  SignUpRequest,
} from "@/lib/types/auth.types";
import { ApiError } from "../api/type";
import { AUTH_ERROR_CODES } from "../api/error-code/auth";

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

      // Don't throw error if it's just a missing session
      if (error && error.message !== "Auth session missing!") {
        throw error;
      }

      return user as AuthUser | null;
    } catch (error) {
      // Return null if session is missing or expired
      console.log("getCurrentUser error:", error);
      return null;
    }
  },

  /**
   * Sign in with email and password
   */
  async signIn(credentials: SignInRequest): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      throw new ApiError(error.code as AUTH_ERROR_CODES, error.message);
    }

    return {
      user: data.user as AuthUser,
    };
  },

  /**
   * Sign up with email and password
   */
  async signUp(credentials: SignUpRequest): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      ...credentials,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/sign-in`,
      },
    });

    if (error) {
      throw new ApiError(error.code as AUTH_ERROR_CODES, error.message);
    }

    return {
      user: data.user as AuthUser,
    };
  },

  /**
   * Send password reset email
   */
  async forgotPassword(request: ForgotPasswordRequest): Promise<AuthResponse> {
    const { error } = await supabase.auth.resetPasswordForEmail(request.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw new ApiError(error.code as AUTH_ERROR_CODES, error.message);
    }

    return { user: null };
  },

  /**
   * Resend email verification
   */
  async resendEmailVerification(email: string): Promise<AuthResponse> {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/sign-in`,
      },
    });

    if (error) {
      throw new ApiError(error.code as AUTH_ERROR_CODES, error.message);
    }

    return { user: null };
  },

  /**
   * Reset password with new password
   */
  async resetPassword(request: ResetPasswordRequest): Promise<AuthResponse> {
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

    console.log("🚀 ~ resetPassword ~ error:", error);

    if (error) {
      throw new ApiError(error.code as AUTH_ERROR_CODES, error.message);
    }

    return { user: null };
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new ApiError(error.code as AUTH_ERROR_CODES, error.message);
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
