import { apiClient } from "@/lib/api-client";
import { handleError } from "@/lib/error-handler";
import { 
  CreateTransactionRequest, 
  CreateExpenseRequest,
  UpdateExpenseRequest,
  UpdateTransactionRequest,
  TransactionResponse,
  TransactionListResponse,
  CreateExpenseResponse,
  UpdateExpenseResponse
} from "@/lib/types/transaction.types";

// Type for translation function
type TranslationFunction = (key: string, options?: { ns?: string | string[] }) => string;

export const transactionService = {
  /**
   * Create a new transaction
   */
  async create(data: CreateTransactionRequest, t?: TranslationFunction): Promise<TransactionResponse> {
    try {
      const response = await apiClient.post<{
        id: string;
        name: string;
        amount: number;
        description: string | null;
        type: "income" | "outcome" | "transfer";
        recurring: number;
        created_at: string;
        updated_at: string;
        user_id: string | null;
      }>('/transactions', {
        name: data.name,
        amount: data.amount,
        description: data.description,
        type: data.type,
        recurring: data.recurring || 0,
      });

      if (response.success && response.data) {
        return {
          transaction: response.data,
          error: null,
        };
      }

      throw new Error(response.error || 'Failed to create transaction');
    } catch (error) {
      const appError = handleError(error, t);
      return {
        transaction: null,
        error: appError.message,
      };
    }
  },

  /**
   * Create an expense and link it to a budget
   */
  async createExpense(data: CreateExpenseRequest, t?: TranslationFunction): Promise<CreateExpenseResponse> {
    try {
      const response = await apiClient.post<{
        transaction: {
          id: string;
          name: string;
          amount: number;
          description: string | null;
          type: "income" | "outcome" | "transfer";
          recurring: number;
          created_at: string;
          updated_at: string;
          user_id: string | null;
        };
        budgetTransaction: {
          id: string;
          budget_id: string;
          transaction_id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
      }>('/transactions', {
        name: data.name,
        amount: data.amount,
        description: data.description,
        type: 'outcome',
        budgetId: data.budgetId,
        date: data.date,
      });

      if (response.success && response.data) {
        return {
          transaction: response.data.transaction,
          budgetTransaction: response.data.budgetTransaction,
          error: null,
        };
      }

      throw new Error(response.error || 'Failed to create expense');
    } catch (error) {
      const appError = handleError(error, t);
      return {
        transaction: null,
        budgetTransaction: null,
        error: appError.message,
      };
    }
  },

  /**
   * Update an existing expense/transaction
   */
  async updateExpense(id: string, data: UpdateExpenseRequest, t?: TranslationFunction): Promise<UpdateExpenseResponse> {
    try {
      const response = await apiClient.put<{
        id: string;
        name: string;
        amount: number;
        description: string | null;
        type: "income" | "outcome" | "transfer";
        recurring: number;
        created_at: string;
        updated_at: string;
        user_id: string | null;
      }>(`/transactions/${id}`, {
        name: data.name,
        amount: data.amount,
        description: data.description,
        date: data.date,
      });

      if (response.success && response.data) {
        return {
          transaction: response.data,
          error: null,
        };
      }

      throw new Error(response.error || 'Failed to update expense');
    } catch (error) {
      const appError = handleError(error, t);
      return {
        transaction: null,
        error: appError.message,
      };
    }
  },

  /**
   * Update an existing transaction
   */
  async update(id: string, data: UpdateTransactionRequest, t?: TranslationFunction): Promise<TransactionResponse> {
    try {
      const response = await apiClient.put<{
        id: string;
        name: string;
        amount: number;
        description: string | null;
        type: "income" | "outcome" | "transfer";
        recurring: number;
        created_at: string;
        updated_at: string;
        user_id: string | null;
      }>(`/transactions/${id}`, data);

      if (response.success && response.data) {
        return {
          transaction: response.data,
          error: null,
        };
      }

      throw new Error(response.error || 'Failed to update transaction');
    } catch (error) {
      const appError = handleError(error, t);
      return {
        transaction: null,
        error: appError.message,
      };
    }
  },

  /**
   * Get all transactions for the current user
   */
  async getAll(limit?: number, t?: TranslationFunction): Promise<TransactionListResponse> {
    try {
      const params: Record<string, string | number> = {};
      if (limit) params.limit = limit;

      const response = await apiClient.get<Array<{
        id: string;
        name: string;
        amount: number;
        description: string | null;
        type: "income" | "outcome" | "transfer";
        recurring: number;
        created_at: string;
        updated_at: string;
        user_id: string | null;
      }>>('/transactions', params);

      if (response.success && response.data) {
        return {
          transactions: response.data,
          error: null,
        };
      }

      throw new Error(response.error || 'Failed to fetch transactions');
    } catch (error) {
      const appError = handleError(error, t);
      return {
        transactions: [],
        error: appError.message,
      };
    }
  },

  /**
   * Get transactions for a specific budget
   */
  async getByBudget(budgetId: string, t?: TranslationFunction): Promise<TransactionListResponse> {
    try {
      const response = await apiClient.get<Array<{
        id: string;
        name: string;
        amount: number;
        description: string | null;
        type: "income" | "outcome" | "transfer";
        recurring: number;
        created_at: string;
        updated_at: string;
        user_id: string | null;
      }>>('/transactions', { budgetId });

      if (response.success && response.data) {
        return {
          transactions: response.data,
          error: null,
        };
      }

      throw new Error(response.error || 'Failed to fetch budget transactions');
    } catch (error) {
      const appError = handleError(error, t);
      return {
        transactions: [],
        error: appError.message,
      };
    }
  },

  /**
   * Delete a transaction
   */
  async delete(id: string, t?: TranslationFunction): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(`/transactions/${id}`);

      if (response.success) {
        return {
          success: true,
          error: null,
        };
      }

      throw new Error(response.error || 'Failed to delete transaction');
    } catch (error) {
      const appError = handleError(error, t);
      return {
        success: false,
        error: appError.message,
      };
    }
  },
}; 