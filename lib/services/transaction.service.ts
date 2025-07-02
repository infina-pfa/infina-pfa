import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/error-handler";
import { 
  CreateTransactionRequest, 
  CreateExpenseRequest,
  TransactionResponse,
  TransactionListResponse,
  CreateExpenseResponse
} from "@/lib/types/transaction.types";

// Type for translation function
type TranslationFunction = (key: string, options?: { ns?: string | string[] }) => string;

export const transactionService = {
  /**
   * Create a new transaction
   */
  async create(data: CreateTransactionRequest, t?: TranslationFunction): Promise<TransactionResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Validate required fields
      if (!data.name?.trim()) {
        throw new Error('Transaction name is required');
      }
      if (!data.amount || data.amount <= 0) {
        throw new Error('Transaction amount must be greater than 0');
      }
      if (!data.type) {
        throw new Error('Transaction type is required');
      }

      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          name: data.name.trim(),
          amount: data.amount,
          description: data.description?.trim() || null,
          type: data.type,
          recurring: data.recurring || 0,
        })
        .select('*')
        .single();

      if (error) throw error;

      return {
        transaction,
        error: null,
      };
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
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Validate required fields
      if (!data.name?.trim()) {
        throw new Error('Expense name is required');
      }
      if (!data.amount || data.amount <= 0) {
        throw new Error('Expense amount must be greater than 0');
      }
      if (!data.budgetId) {
        throw new Error('Budget ID is required');
      }

      // Verify budget exists and belongs to user
      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .select('id')
        .eq('id', data.budgetId)
        .eq('user_id', user.id)
        .single();

      if (budgetError || !budget) {
        throw new Error('Budget not found');
      }

      // Start a transaction to ensure both records are created
      // First create the transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          name: data.name.trim(),
          amount: data.amount,
          description: data.description?.trim() || null,
          type: 'outcome',
          recurring: 0,
          created_at: data.date ? new Date(data.date).toISOString() : undefined,
        })
        .select('*')
        .single();

      if (transactionError) throw transactionError;

      // Then link it to the budget
      const { data: budgetTransaction, error: linkError } = await supabase
        .from('budget_transactions')
        .insert({
          user_id: user.id,
          budget_id: data.budgetId,
          transaction_id: transaction.id,
        })
        .select('*')
        .single();

      if (linkError) {
        // If linking fails, delete the transaction to maintain consistency
        await supabase
          .from('transactions')
          .delete()
          .eq('id', transaction.id);
        throw linkError;
      }

      return {
        transaction,
        budgetTransaction,
        error: null,
      };
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
   * Get all transactions for the current user
   */
  async getAll(limit?: number, t?: TranslationFunction): Promise<TransactionListResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        transactions: data || [],
        error: null,
      };
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
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          budget_transactions!inner (
            budget_id
          )
        `)
        .eq('user_id', user.id)
        .eq('budget_transactions.budget_id', budgetId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        transactions: data || [],
        error: null,
      };
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
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Check if transaction exists and belongs to user
      const { data: existingTransaction, error: checkError } = await supabase
        .from('transactions')
        .select('id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (checkError || !existingTransaction) {
        throw new Error('Transaction not found');
      }

      // Delete budget_transactions first (if any)
      await supabase
        .from('budget_transactions')
        .delete()
        .eq('transaction_id', id);

      // Then delete the transaction
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      return {
        success: true,
        error: null,
      };
    } catch (error) {
      const appError = handleError(error, t);
      return {
        success: false,
        error: appError.message,
      };
    }
  },
}; 