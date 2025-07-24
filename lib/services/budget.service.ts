import { apiClient } from "@/lib/api-client";
import { handleError } from "@/lib/error-handler";
import {
  CreateBudgetRequest,
  UpdateBudgetRequest,
  BudgetResponse,
  BudgetListResponse,
  BudgetFilters,
  BudgetStats,
  BudgetWithSpending,
} from "@/lib/types/budget.types";

// Type for translation function
type TranslationFunction = (
  key: string,
  options?: { ns?: string | string[] }
) => string;

export const budgetService = {
  /**
   * Get all budgets for the current user with optional filters
   */
  async getAll(
    filters?: BudgetFilters,
    t?: TranslationFunction
  ): Promise<BudgetListResponse> {
    try {
      const params: Record<string, string | number> = {};

      if (filters?.month) params.month = filters.month;
      if (filters?.year) params.year = filters.year;
      if (filters?.category) params.category = filters.category;

      const response = await apiClient.get<BudgetWithSpending[]>(
        "/budgets",
        params
      );

      if (response.success && response.data) {
        return {
          budgets: response.data,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to fetch budgets");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        budgets: [],
        error: appError.message,
      };
    }
  },

  /**
   * Get budgets with spending data for the current user
   */
  async getAllWithSpending(
    filters?: BudgetFilters,
    t?: TranslationFunction
  ): Promise<{
    budgets: BudgetWithSpending[];
    totalBudget: number;
    totalSpent: number;
    error: string | null;
  }> {
    try {
      const params: Record<string, string | number> = {};

      if (filters?.month) params.month = filters.month;
      if (filters?.year) params.year = filters.year;
      if (filters?.category) params.category = filters.category;

      // Add parameter to request spending data
      params.withSpending = "true";

      const response = await apiClient.get<{
        budgets: BudgetWithSpending[];
        totalBudget: number;
        totalSpent: number;
      }>("/budgets", params);

      if (response.success && response.data) {
        return {
          budgets: response.data.budgets,
          totalBudget: response.data.totalBudget,
          totalSpent: response.data.totalSpent,
          error: null,
        };
      }

      throw new Error(
        response.error || "Failed to fetch budgets with spending"
      );
    } catch (error) {
      const appError = handleError(error, t);
      return {
        budgets: [],
        totalBudget: 0,
        totalSpent: 0,
        error: appError.message,
      };
    }
  },

  /**
   * Get a single budget by ID
   */
  async getById(id: string, t?: TranslationFunction): Promise<BudgetResponse> {
    try {
      const response = await apiClient.get<BudgetWithSpending>(
        `/budgets/${id}`
      );

      if (response.success && response.data) {
        return {
          budget: response.data,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to fetch budget");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        budget: null,
        error: appError.message,
      };
    }
  },

  /**
   * Create a new budget
   */
  async create(
    data: CreateBudgetRequest,
    t?: TranslationFunction
  ): Promise<BudgetResponse> {
    try {
      const response = await apiClient.post<BudgetWithSpending>(
        "/budgets",
        data
      );

      if (response.success && response.data) {
        return {
          budget: response.data,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to create budget");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        budget: null,
        error: appError.message,
      };
    }
  },

  /**
   * Update an existing budget
   */
  async update(
    id: string,
    data: UpdateBudgetRequest,
    t?: TranslationFunction
  ): Promise<BudgetResponse> {
    try {
      const response = await apiClient.put<BudgetWithSpending>(
        `/budgets/${id}`,
        data
      );

      if (response.success && response.data) {
        return {
          budget: response.data,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to update budget");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        budget: null,
        error: appError.message,
      };
    }
  },

  /**
   * Delete a budget
   */
  async delete(
    id: string,
    t?: TranslationFunction
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(
        `/budgets/${id}`
      );

      if (response.success) {
        return {
          success: true,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to delete budget");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        success: false,
        error: appError.message,
      };
    }
  },

  /**
   * Get budget statistics
   */
  async getStats(
    t?: TranslationFunction
  ): Promise<{ stats: BudgetStats | null; error: string | null }> {
    try {
      const response = await apiClient.get<BudgetStats>("/budgets/stats");

      if (response.success && response.data) {
        return {
          stats: response.data,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to fetch budget stats");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        stats: null,
        error: appError.message,
      };
    }
  },

  /**
   * Get recent transactions for all budgets
   */
  async getRecentTransactions(
    limit: number = 10,
    t?: TranslationFunction
  ): Promise<{
    transactions: Array<{
      id: string;
      name: string;
      amount: number;
      date: string;
      category: string;
      type: string;
      description: string | null;
      budgetName?: string;
      budgetColor?: string;
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
          category: string;
          type: string;
          description: string | null;
          budgetName?: string;
          budgetColor?: string;
        }>
      >("/transactions", { limit });

      if (response.success && response.data) {
        return {
          transactions: response.data,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to fetch recent transactions");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        transactions: [],
        error: appError.message,
      };
    }
  },

  /**
   * Create priority-based budgets from allocation data
   */
  async createPriorityBasedBudgets(
    allocation: {
      emergencyFund: number;
      livingExpenses: number;
      freeToSpend: number;
    },
    monthlyIncome: number,
    t?: TranslationFunction
  ): Promise<{ budgets: BudgetWithSpending[]; error: string | null }> {
    try {
      // Calculate monetary values from percentages
      const monetaryValues = {
        emergencyFund: (monthlyIncome * allocation.emergencyFund) / 100,
        livingExpenses: (monthlyIncome * allocation.livingExpenses) / 100,
        freeToSpend: (monthlyIncome * allocation.freeToSpend) / 100,
      };

      // Define the priority-based budget categories
      const budgetCategories = [
        {
          name: t ? t("emergencyFund", { ns: "budgeting" }) : "Emergency Fund",
          category: "savings",
          amount: monetaryValues.emergencyFund,
          color: "#0055FF",
          description: t
            ? t("emergencyFundDescription", { ns: "budgeting" })
            : "Priority 1: Emergency fund savings",
          priority: 1,
        },
        {
          name: t
            ? t("livingExpenses", { ns: "budgeting" })
            : "Living Expenses",
          category: "essential",
          amount: monetaryValues.livingExpenses,
          color: "#2ECC71",
          description: t
            ? t("livingExpensesDescription", { ns: "budgeting" })
            : "Priority 2: Essential living costs and future plans",
          priority: 2,
        },
        {
          name: t ? t("freeToSpend", { ns: "budgeting" }) : "Free to Spend",
          category: "discretionary",
          amount: monetaryValues.freeToSpend,
          color: "#FF9800",
          description: t
            ? t("freeToSpendDescription", { ns: "budgeting" })
            : "Priority 3: Discretionary spending",
          priority: 3,
        },
      ];

      // Create all budgets in sequence
      const createdBudgets: BudgetWithSpending[] = [];
      const errors: string[] = [];

      for (const budgetData of budgetCategories) {
        const createRequest: CreateBudgetRequest = {
          name: budgetData.name,
          category: budgetData.category,
          amount: budgetData.amount,
          color: budgetData.color,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        };

        const result = await this.create(createRequest, t);

        if (result.error) {
          errors.push(`Failed to create ${budgetData.name}: ${result.error}`);
        } else if (result.budget) {
          createdBudgets.push({
            ...result.budget,
            spent: 0,
            remaining: result.budget.amount,
          });
        }
      }

      // If there were errors creating some budgets, return partial success
      if (errors.length > 0) {
        return {
          budgets: createdBudgets,
          error: `Some budgets failed to create: ${errors.join(", ")}`,
        };
      }

      return {
        budgets: createdBudgets,
        error: null,
      };
    } catch (error) {
      const appError = handleError(error, t);
      return {
        budgets: [],
        error: appError.message,
      };
    }
  },

  /**
   * Update user's budgeting philosophy
   */
  async updateBudgetingPhilosophy(
    philosophy: "goal_focused" | "detail_tracker",
    t?: TranslationFunction
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await apiClient.put<{ success: boolean }>(
        "/user/budgeting-philosophy",
        {
          budgetingStyle: philosophy,
        }
      );

      if (response.success) {
        return {
          success: true,
          error: null,
        };
      }

      throw new Error(
        response.error || "Failed to update budgeting philosophy"
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
