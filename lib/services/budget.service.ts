import { apiClient } from "@/lib/api-client";
import {
  BudgetResponse,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  SpendRequest,
  BudgetDetailResponse,
  TransactionResponse,
} from "@/lib/types/budget.types";

/**
 * Budget Service Layer
 * Acts as the "API Menu" - a clean abstraction over the API routes
 * Each method knows HOW to talk to the corresponding endpoint
 */
export const budgetService = {
  /**
   * Fetches all budgets for a specific month and year
   */
  async getBudgets(month: number, year: number): Promise<BudgetResponse[]> {
    const response = await apiClient.get<BudgetResponse[]>("/budgets", {
      month,
      year,
    });
    return response.data || [];
  },

  /**
   * Creates a new budget
   */
  async createBudget(data: CreateBudgetRequest): Promise<BudgetResponse> {
    const response = await apiClient.post<BudgetResponse>("/budgets", data);
    if (!response.data) {
      throw new Error("Failed to create budget");
    }
    return response.data;
  },

  /**
   * Fetches detailed information about a specific budget
   */
  async getBudgetDetail(budgetId: string): Promise<BudgetDetailResponse> {
    const response = await apiClient.get<BudgetDetailResponse>(
      `/budgets/${budgetId}`
    );
    if (!response.data) {
      throw new Error("Budget not found");
    }
    return response.data;
  },

  /**
   * Updates an existing budget
   */
  async updateBudget(
    budgetId: string,
    data: UpdateBudgetRequest
  ): Promise<BudgetResponse> {
    const response = await apiClient.patch<BudgetResponse>(
      `/budgets/${budgetId}`,
      data
    );
    if (!response.data) {
      throw new Error("Failed to update budget");
    }
    return response.data;
  },

  /**
   * Deletes a budget
   */
  async deleteBudget(budgetId: string): Promise<void> {
    await apiClient.delete(`/budgets/${budgetId}`);
  },

  /**
   * Records spending against a budget
   */
  async recordSpending(
    budgetId: string,
    data: SpendRequest
  ): Promise<BudgetDetailResponse> {
    const response = await apiClient.post<BudgetDetailResponse>(
      `/budgets/${budgetId}/spend`,
      data
    );
    if (!response.data) {
      throw new Error("Failed to record spending");
    }
    return response.data;
  },

  /**
   * Deletes a specific spending transaction
   */
  async deleteSpending(budgetId: string, spendingId: string): Promise<void> {
    await apiClient.delete(`/budgets/${budgetId}/spending/${spendingId}`);
  },

  /**
   * Fetches all spending transactions for a specific month and year
   */
  async getMonthlySpending(
    month: number,
    year: number
  ): Promise<TransactionResponse[]> {
    const response = await apiClient.get<TransactionResponse[]>(
      "/budgets/spending",
      { month, year }
    );
    return response.data || [];
  },
};
