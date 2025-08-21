import { apiClient } from "@/lib/api-client";
import {
  DebtResponse,
  CreateDebtRequest,
  UpdateDebtRequest,
  PayDebtRequest,
  DebtDetailResponse,
  DebtSimple,
  MonthlyPaymentResponse,
} from "@/lib/types/debt.types";

/**
 * Debt Service Layer
 * Acts as the "API Menu" - a clean abstraction over the API routes
 * Each method knows HOW to talk to the corresponding endpoint
 */
export const debtService = {
  /**
   * Fetches all debts for the authenticated user
   */
  async getDebts(): Promise<DebtResponse[]> {
    const response = await apiClient.get<DebtResponse[]>("/debts");
    return response.data || [];
  },

  /**
   * Creates a new debt
   */
  async createDebt(data: CreateDebtRequest): Promise<DebtResponse> {
    const response = await apiClient.post<DebtResponse>("/debts", data);
    if (!response.data) {
      throw new Error("Failed to create debt");
    }
    return response.data;
  },

  /**
   * Fetches detailed information about a specific debt including payments
   */
  async getDebtDetail(debtId: string): Promise<DebtDetailResponse> {
    const response = await apiClient.get<DebtDetailResponse>(
      `/debts/${debtId}`
    );
    if (!response.data) {
      throw new Error("Debt not found");
    }
    return response.data;
  },

  /**
   * Updates an existing debt
   */
  async updateDebt(
    debtId: string,
    data: UpdateDebtRequest
  ): Promise<DebtSimple> {
    const response = await apiClient.patch<DebtSimple>(
      `/debts/${debtId}`,
      data
    );
    if (!response.data) {
      throw new Error("Failed to update debt");
    }
    return response.data;
  },

  /**
   * Deletes a debt and all associated payment transactions
   */
  async deleteDebt(debtId: string): Promise<void> {
    await apiClient.delete(`/debts/${debtId}`);
  },

  /**
   * Records a payment transaction against a debt
   */
  async recordPayment(
    debtId: string,
    data: PayDebtRequest
  ): Promise<DebtDetailResponse> {
    const response = await apiClient.post<DebtDetailResponse>(
      `/debts/${debtId}/payments`,
      data
    );
    if (!response.data) {
      throw new Error("Failed to record payment");
    }
    return response.data;
  },

  /**
   * Deletes a specific payment transaction from a debt
   */
  async deletePayment(debtId: string, paymentId: string): Promise<void> {
    await apiClient.delete(`/debts/${debtId}/payments/${paymentId}`);
  },

  /**
   * Fetches the total monthly debt payment amount for the authenticated user
   */
  async getMonthlyPayment(): Promise<MonthlyPaymentResponse> {
    const response = await apiClient.get<MonthlyPaymentResponse>(
      "/debts/monthly-payment"
    );
    if (!response.data) {
      throw new Error("Failed to fetch monthly payment");
    }
    return response.data;
  },
};