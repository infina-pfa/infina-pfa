import { apiClient } from "@/lib/api-client";
import {
  IncomeResponse,
  CreateIncomeRequest,
  UpdateIncomeRequest,
} from "@/lib/types/income.types";

/**
 * Income Service Layer
 * Handles all income-related API interactions
 */
export const incomeService = {
  /**
   * Fetches all income transactions for a specific month and year
   */
  async getMonthlyIncome(month: number, year: number): Promise<IncomeResponse[]> {
    const response = await apiClient.get<IncomeResponse[]>("/incomes", {
      month,
      year,
    });
    return response.data || [];
  },

  /**
   * Creates a new income transaction
   */
  async createIncome(data: CreateIncomeRequest): Promise<IncomeResponse> {
    const response = await apiClient.post<IncomeResponse>("/incomes", data);
    if (!response.data) {
      throw new Error("Failed to create income");
    }
    return response.data;
  },

  /**
   * Updates an existing income transaction
   */
  async updateIncome(
    incomeId: string,
    data: UpdateIncomeRequest
  ): Promise<IncomeResponse> {
    const response = await apiClient.patch<IncomeResponse>(
      `/incomes/${incomeId}`,
      data
    );
    if (!response.data) {
      throw new Error("Failed to update income");
    }
    return response.data;
  },

  /**
   * Deletes an income transaction
   */
  async deleteIncome(incomeId: string): Promise<void> {
    await apiClient.delete(`/incomes/${incomeId}`);
  },
};