import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/error-handler";
import { CreateUserRequest, UserProfile, UserResponse, UserCheckResponse } from "@/lib/types/user.types";

// Type for translation function
type TranslationFunction = (key: string) => string;

export const userService = {
  /**
   * Check if user profile exists for authenticated user
   */
  async checkUserExists(userId: string): Promise<UserCheckResponse> {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows found - user doesn't exist
        return {
          exists: false,
          user: null,
          error: null,
        };
      }

      if (error) throw error;

      return {
        exists: true,
        user: user as UserProfile,
        error: null,
      };
    } catch (error) {
      const appError = handleError(error);
      return {
        exists: false,
        user: null,
        error: appError.message,
      };
    }
  },

  /**
   * Create a new user profile
   */
  async createUser(userId: string, request: CreateUserRequest, t?: TranslationFunction): Promise<UserResponse> {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .insert([
          {
            user_id: userId,
            name: request.name,
            total_asset_value: 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        user: user as UserProfile,
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
   * Get user profile by auth user ID
   */
  async getUserProfile(userId: string, t?: TranslationFunction): Promise<UserResponse> {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      return {
        user: user as UserProfile,
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
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<CreateUserRequest>, t?: TranslationFunction): Promise<UserResponse> {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      return {
        user: user as UserProfile,
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
}; 