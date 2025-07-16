import { apiClient } from "@/lib/api-client";
import { handleError } from "@/lib/error-handler";
import { CreateUserRequest, UserProfile, UserResponse, UserCheckResponse, UserUpdate, BudgetingStyle } from "@/lib/types/user.types";

// Type for translation function
type TranslationFunction = (key: string) => string;

export const userService = {
  /**
   * Check if user profile exists for authenticated user
   */
  async checkUserExists(): Promise<UserCheckResponse> {
    try {
      const response = await apiClient.get<UserProfile>(`/users/profile`);
      
      if (response.success && response.data) {
        return {
          exists: true,
          user: response.data,
          error: null,
        };
      }

      return {
        exists: false,
        user: null,
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
  async createUser(request: CreateUserRequest, t?: TranslationFunction): Promise<UserResponse> {
    try {
      const response = await apiClient.post<UserProfile>('/users/profile', {
        name: request.name,
        total_asset_value: 0,
      });

      if (response.success && response.data) {
        return {
          user: response.data,
          error: null,
        };
      }

      throw new Error(response.error || 'Failed to create user');
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
  async getUserProfile(t?: TranslationFunction): Promise<UserResponse> {
    try {
      const response = await apiClient.get<UserProfile>('/users/profile');

      if (response.success && response.data) {
        return {
          user: response.data,
          error: null,
        };
      }

      throw new Error(response.error || 'Failed to get user profile');
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
  async updateUserProfile(updates: UserUpdate, t?: TranslationFunction): Promise<UserResponse> {
    try {
      const response = await apiClient.patch<UserProfile>('/users/profile', {
        ...updates,
        updated_at: new Date().toISOString(),
      });

      if (response.success && response.data) {
        return {
          user: response.data,
          error: null,
        };
      }

      throw new Error(response.error || 'Failed to update user profile');
    } catch (error) {
      const appError = handleError(error, t);
      return {
        user: null,
        error: appError.message,
      };
    }
  },

  /**
   * Update user budgeting style
   */
  async updateBudgetingStyle(budgetingStyle: BudgetingStyle, t?: TranslationFunction): Promise<UserResponse> {
    try {
      const response = await apiClient.patch<UserProfile>('/users/profile', {
        budgeting_style: budgetingStyle,
        updated_at: new Date().toISOString(),
      });

      if (response.success && response.data) {
        return {
          user: response.data,
          error: null,
        };
      }

      throw new Error(response.error || 'Failed to update budgeting style');
    } catch (error) {
      const appError = handleError(error, t);
      return {
        user: null,
        error: appError.message,
      };
    }
  },
}; 