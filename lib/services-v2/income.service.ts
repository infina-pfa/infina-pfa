import { apiClient } from "@/lib/api-client";
import { handleError } from "@/lib/error-handler";
import {
  CreateIncomeRequest,
  UpdateIncomeRequest,
  IncomeResponse,
  IncomeListResponse,
  IncomeFilters,
  IncomeStats,
  IncomeAnalytics,
  Income,
} from "@/lib/types/income.types";

// Type for translation function
type TranslationFunction = (
  key: string,
  options?: { ns?: string | string[] }
) => string;

export const incomeService = {
  /**
   * Get all incomes for the current user with optional filters
   */
  async getAll(
    filters?: IncomeFilters,
    t?: TranslationFunction
  ): Promise<IncomeListResponse> {
    try {
      const params: Record<string, string | number> = {};

      if (filters?.month) params.month = filters.month;
      if (filters?.year) params.year = filters.year;
      if (filters?.category) params.category = filters.category;
      if (filters?.recurring !== undefined)
        params.recurring = filters.recurring.toString();

      const response = await apiClient.get<Income[]>("/incomes", params);

      if (response.success && response.data) {
        return {
          incomes: response.data,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to fetch incomes");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        incomes: [],
        error: appError.message,
      };
    }
  },

  /**
   * Get a single income by ID
   */
  async getById(id: string, t?: TranslationFunction): Promise<IncomeResponse> {
    try {
      const response = await apiClient.get<Income>(`/incomes/${id}`);

      if (response.success && response.data) {
        return {
          income: response.data,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to fetch income");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        income: null,
        error: appError.message,
      };
    }
  },

  /**
   * Create a new income
   */
  async create(
    data: CreateIncomeRequest,
    t?: TranslationFunction
  ): Promise<IncomeResponse> {
    try {
      const response = await apiClient.post<Income>("/incomes", data);

      if (response.success && response.data) {
        return {
          income: response.data,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to create income");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        income: null,
        error: appError.message,
      };
    }
  },

  /**
   * Update an existing income
   */
  async update(
    id: string,
    data: UpdateIncomeRequest,
    t?: TranslationFunction
  ): Promise<IncomeResponse> {
    try {
      const response = await apiClient.put<Income>(`/incomes/${id}`, data);

      if (response.success && response.data) {
        return {
          income: response.data,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to update income");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        income: null,
        error: appError.message,
      };
    }
  },

  /**
   * Delete an income
   */
  async delete(
    id: string,
    t?: TranslationFunction
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(
        `/incomes/${id}`
      );

      if (response.success) {
        return {
          success: true,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to delete income");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        success: false,
        error: appError.message,
      };
    }
  },

  /**
   * Get income statistics
   */
  async getStats(
    filters?: { month?: number; year?: number },
    t?: TranslationFunction
  ): Promise<{ stats: IncomeStats | null; error: string | null }> {
    try {
      const params: Record<string, string | number> = {};

      if (filters?.month) params.month = filters.month;
      if (filters?.year) params.year = filters.year;

      const response = await apiClient.get<IncomeStats>(
        "/incomes/stats",
        params
      );

      if (response.success && response.data) {
        return {
          stats: response.data,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to fetch income stats");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        stats: null,
        error: appError.message,
      };
    }
  },

  /**
   * Get income analytics
   */
  async getAnalytics(
    filters?: { year?: number },
    t?: TranslationFunction
  ): Promise<{ analytics: IncomeAnalytics | null; error: string | null }> {
    try {
      const params: Record<string, string | number> = {};

      if (filters?.year) params.year = filters.year;

      const response = await apiClient.get<IncomeAnalytics>(
        "/incomes/analytics",
        params
      );

      if (response.success && response.data) {
        return {
          analytics: response.data,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to fetch income analytics");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        analytics: null,
        error: appError.message,
      };
    }
  },

  /**
   * Get recurring incomes only
   */
  async getRecurring(t?: TranslationFunction): Promise<IncomeListResponse> {
    try {
      const response = await apiClient.get<Income[]>("/incomes", {
        recurring: "true",
      });

      if (response.success && response.data) {
        return {
          incomes: response.data,
          error: null,
        };
      }

      throw new Error(response.error || "Failed to fetch recurring incomes");
    } catch (error) {
      const appError = handleError(error, t);
      return {
        incomes: [],
        error: appError.message,
      };
    }
  },
};
