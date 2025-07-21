import { apiClient } from "@/lib/api-client";
import { handleError } from "@/lib/error-handler";
import {
  CreateGoalRequest,
  UpdateGoalRequest,
  GoalResponse,
  GoalListResponse,
  GoalFilters,
  GoalStats,
  AddTransactionToGoalRequest,
  AddTransactionToGoalResponse,
  CreateGoalTransactionIncomeRequest,
  CreateGoalTransactionIncomeResponse,
  CreateGoalTransactionWithdrawalRequest,
  CreateGoalTransactionWithdrawalResponse,
  GoalIncomeTransactionFilters,
  GoalIncomeTransactionsResponse,
  Goal,
} from "@/lib/types/goal.types";
import { Transaction } from "../types/transaction.types";

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
  ): Promise<{ goals: Goal[]; error: string | null }> {
    try {
      const params: Record<string, string | number> = {};

      if (filters?.completed !== undefined)
        params.completed = filters.completed ? "1" : "0";
      if (filters?.upcoming !== undefined)
        params.upcoming = filters.upcoming ? "1" : "0";

      // Add parameter to request transactions data
      params.withTransactions = "1";

      const response = await apiClient.get<Goal[]>("/goals", params);

      if (response.success && response.data) {
        console.log("🚀 ~ response.data:", response.data);
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
      const response = await apiClient.get<Goal>(`/goals/${id}`);

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
      const response = await apiClient.post<Goal>("/goals", data);

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
      const response = await apiClient.put<Goal>(`/goals/${id}`, data);

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
      const response = await apiClient.post<Transaction>(
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

  /**
   * Create a goal transaction income
   * This creates a transaction record first, then links it to the goal
   */
  async createGoalTransactionIncome(
    data: CreateGoalTransactionIncomeRequest,
    t?: TranslationFunction
  ): Promise<CreateGoalTransactionIncomeResponse> {
    try {
      const response = await apiClient.post<{
        transaction: Transaction;
        goalTransaction: {
          id: string;
          goal_id: string;
          transaction_id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        updatedCurrentAmount: number;
      }>("/goals/transactions", data);

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          error: null,
        };
      }

      throw new Error(
        response.error || "Failed to create goal transaction income"
      );
    } catch (error) {
      const appError = handleError(error, t);
      return {
        success: false,
        data: undefined,
        error: appError.message,
      };
    }
  },

  /**
   * Create a goal transaction withdrawal
   * This creates a withdrawal transaction and reduces the goal's current amount
   */
  async createGoalTransactionWithdrawal(
    data: CreateGoalTransactionWithdrawalRequest,
    t?: TranslationFunction
  ): Promise<CreateGoalTransactionWithdrawalResponse> {
    try {
      const response = await apiClient.post<{
        transaction: Transaction;
        goalTransaction: {
          id: string;
          goal_id: string;
          transaction_id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        updatedCurrentAmount: number;
      }>("/goals/transactions/withdraw", data);

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          error: null,
        };
      }

      throw new Error(
        response.error || "Failed to create goal transaction withdrawal"
      );
    } catch (error) {
      const appError = handleError(error, t);
      return {
        success: false,
        data: undefined,
        error: appError.message,
      };
    }
  },

  /**
   * Get goal income transactions for a specific month and year
   */
  async getGoalIncomeTransactions(
    filters: GoalIncomeTransactionFilters,
    t?: TranslationFunction
  ): Promise<GoalIncomeTransactionsResponse> {
    try {
      const params: Record<string, string> = {
        month: filters.month.toString(),
        year: filters.year.toString(),
      };

      if (filters.goalId) {
        params.goalId = filters.goalId;
      }

      const response = await apiClient.get<{
        transactions: Array<{
          id: string;
          goalTransactionId: string;
          transactionId: string;
          goalId: string;
          name: string;
          amount: number;
          description: string | null;
          type: string;
          recurring: number;
          date: string;
          createdAt: string;
          goalTitle: string;
          goalDescription: string | null;
          goalCurrentAmount: number;
          goalTargetAmount: number | null;
        }>;
        summary: {
          month: number;
          year: number;
          totalAmount: number;
          transactionCount: number;
          uniqueGoals: number;
        };
      }>("/goals/transactions/income", params);

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          error: null,
        };
      }

      throw new Error(
        response.error || "Failed to fetch goal income transactions"
      );
    } catch (error) {
      const appError = handleError(error, t);
      return {
        success: false,
        data: undefined,
        error: appError.message,
      };
    }
  },

  /**
   * Get emergency fund dashboard data
   */
  async getDashboardData(t?: TranslationFunction): Promise<{
    currentAmount: number;
    targetAmount: number;
    monthsOfCoverage: number;
    progressPercentage: number;
    projectedCompletionDate: string;
    monthlySavingsRate: number;
  }> {
    try {
      const response = await apiClient.get<{
        currentAmount: number;
        targetAmount: number;
        monthsOfCoverage: number;
        progressPercentage: number;
        projectedCompletionDate: string;
        monthlySavingsRate: number;
      }>("/goals/emergency-fund/dashboard");

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.error || "Failed to fetch dashboard data");
    } catch (error) {
      const appError = handleError(error, t);
      throw new Error(appError.message);
    }
  },

  /**
   * Get pay yourself first confirmation data
   */
  async getPayYourselfFirstData(t?: TranslationFunction): Promise<{
    recommendedAmount: number;
    userInput: number;
    status: "pending" | "completed" | "postponed";
    dueDate: string;
  }> {
    try {
      const response = await apiClient.get<{
        recommendedAmount: number;
        userInput: number;
        status: "pending" | "completed" | "postponed";
        dueDate: string;
      }>("/goals/emergency-fund/pay-yourself-first");

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(
        response.error || "Failed to fetch pay yourself first data"
      );
    } catch (error) {
      const appError = handleError(error, t);
      throw new Error(appError.message);
    }
  },

  /**
   * Update emergency fund contribution
   */
  async updateEmergencyFundContribution(
    data: {
      amount: number;
      status: "completed" | "postponed";
      date: string;
    },
    t?: TranslationFunction
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.post<{ success: boolean }>(
        "/goals/emergency-fund/contribution",
        data
      );

      if (response.success) {
        return {
          success: true,
        };
      }

      throw new Error(response.error || "Failed to update contribution");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        success: false,
        error: appError.message,
      };
    }
  },
};
