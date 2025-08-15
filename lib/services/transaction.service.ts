import { UpdateExpenseRequest } from "@/lib/types/transaction.types";
import { apiClient } from "../api/api-client";

/**
 * Minimal transaction service for operations not covered by budget service
 * This service handles update operations for expenses/transactions
 */
export const transactionService = {
  /**
   * Update an expense transaction
   * Note: This endpoint might not exist in the budget API,
   * so it may need to be implemented or use a different approach
   */
  async updateExpense(
    id: string,
    data: UpdateExpenseRequest
  ): Promise<{
    id: string;
    name: string;
    amount: number;
    description: string | null;
    type: string;
    recurring: number;
    createdAt: string;
    updatedAt: string;
  }> {
    // Try to update through a transaction endpoint if it exists
    // Otherwise, this would need to be implemented in the backend
    const response = await apiClient.put(`/transactions/${id}`, {
      name: data.name,
      amount: data.amount,
      description: data.description,
      date: data.date,
    });

    if (!response.data) {
      throw new Error("Failed to update expense");
    }

    return response.data;
  },
};
