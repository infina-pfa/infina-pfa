import { apiClient } from "@/lib/api-client";
import { handleError } from "@/lib/error-handler";
import {
  CreateGoalRequest,
  UpdateGoalRequest,
  GoalResponse,
  GoalListResponse,
  GoalFilters,
  GoalStats,
  GoalWithTransactions,
  AddTransactionToGoalRequest,
  AddTransactionToGoalResponse,
  GoalTransaction,
  Goal,
} from "@/lib/types/goal.types";

// Type for translation function
type TranslationFunction = (
  key: string,
  options?: { ns?: string | string[] }
) => string;

export const goalService = {
  /**
   * Get all goals for the current user with optional filters
   */
  async getAll(
    filters?: GoalFilters,
    t?: TranslationFunction
  ): Promise<GoalListResponse> {
    try {
      const params: Record<string, string | number> = {};

      if (filters?.completed !== undefined)
        params.completed = filters.completed ? "1" : "0";
      if (filters?.upcoming !== undefined)
        params.upcoming = filters.upcoming ? "1" : "0";

      const response = await apiClient.get<Goal[]>("/goals", params);

      if (response.success && response.data) {
        return {
          goals: response.data,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to fetch goals");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        goals: [],
        error: appError.message,
      };
    }
  },

  /**
   * Get goals with transactions data for the current user
   */
  async getAllWithTransactions(
    filters?: GoalFilters,
    t?: TranslationFunction
  ): Promise<{ goals: GoalWithTransactions[]; error: string | null }> {
    try {
      const params: Record<string, string | number> = {};

      if (filters?.completed !== undefined)
        params.completed = filters.completed ? "1" : "0";
      if (filters?.upcoming !== undefined)
        params.upcoming = filters.upcoming ? "1" : "0";

      // Add parameter to request transactions data
      params.withTransactions = "1";

      const response = await apiClient.get<GoalWithTransactions[]>(
        "/goals",
        params
      );

      if (response.success && response.data) {
        return {
          goals: response.data,
          error: null,
        };
      }

      throw new Error(
        response.error || "Failed to fetch goals with transactions"
      );
    } catch (error) {
      const appError = handleError(error, t);
      return {
        goals: [],
        error: appError.message,
      };
    }
  },

  /**
   * Get a single goal by ID
   */
  async getById(id: string, t?: TranslationFunction): Promise<GoalResponse> {
    try {
      const response = await apiClient.get<GoalWithTransactions>(
        `/goals/${id}`
      );

      if (response.success && response.data) {
        return {
          goal: response.data,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to fetch goal");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        goal: null,
        error: appError.message,
      };
    }
  },

  /**
   * Create a new goal
   */
  async create(
    data: CreateGoalRequest,
    t?: TranslationFunction
  ): Promise<GoalResponse> {
    try {
      const response = await apiClient.post<GoalWithTransactions>(
        "/goals",
        data
      );

      if (response.success && response.data) {
        return {
          goal: response.data,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to create goal");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        goal: null,
        error: appError.message,
      };
    }
  },

  /**
   * Update an existing goal
   */
  async update(
    id: string,
    data: UpdateGoalRequest,
    t?: TranslationFunction
  ): Promise<GoalResponse> {
    try {
      const response = await apiClient.put<GoalWithTransactions>(
        `/goals/${id}`,
        data
      );

      if (response.success && response.data) {
        return {
          goal: response.data,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to update goal");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        goal: null,
        error: appError.message,
      };
    }
  },

  /**
   * Delete a goal
   */
  async delete(
    id: string,
    t?: TranslationFunction
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(
        `/goals/${id}`
      );

      if (response.success) {
        return {
          success: true,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to delete goal");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        success: false,
        error: appError.message,
      };
    }
  },

  /**
   * Get goal statistics
   */
  async getStats(
    t?: TranslationFunction
  ): Promise<{ stats: GoalStats | null; error: string | null }> {
    try {
      const response = await apiClient.get<GoalStats>("/goals/stats");

      if (response.success && response.data) {
        return {
          stats: response.data,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to fetch goal stats");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        stats: null,
        error: appError.message,
      };
    }
  },

  /**
   * Get transactions for a specific goal
   */
  async getTransactions(
    goalId: string,
    t?: TranslationFunction
  ): Promise<{
    transactions: Array<{
      id: string;
      name: string;
      amount: number;
      date: string;
      type: string;
      description: string | null;
    }>;
    error: string | null;
  }> {
    try {
      const response = await apiClient.get<
        Array<{
          id: string;
          name: string;
          amount: number;
          date: string;
          type: string;
          description: string | null;
        }>
      >(`/goals/${goalId}/transactions`);

      if (response.success && response.data) {
        return {
          transactions: response.data,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to fetch goal transactions");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        transactions: [],
        error: appError.message,
      };
    }
  },

  /**
   * Add a transaction to a goal
   */
  async addTransaction(
    data: AddTransactionToGoalRequest,
    t?: TranslationFunction
  ): Promise<AddTransactionToGoalResponse> {
    try {
      const response = await apiClient.post<GoalTransaction>(
        "/goals/transactions",
        data
      );

      if (response.success && response.data) {
        return {
          success: true,
          goalTransaction: response.data,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to add transaction to goal");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        success: false,
        goalTransaction: null,
        error: appError.message,
      };
    }
  },

  /**
   * Remove a transaction from a goal
   */
  async removeTransaction(
    goalId: string,
    transactionId: string,
    t?: TranslationFunction
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(
        `/goals/${goalId}/transactions/${transactionId}`
      );

      if (response.success) {
        return {
          success: true,
          error: null,
        };
      }

      throw new Error(
        response.error || "Failed to remove transaction from goal"
      );
    } catch (error) {
      const appError = handleError(error, t);
      return {
        success: false,
        error: appError.message,
      };
    }
  },
};
