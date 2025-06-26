import { apiClient } from '@/lib/api-client';
import {
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  GetExpensesQuery,
  ExpenseSummary,
} from '@/lib/types/expense.types';

export const expenseService = {
  /**
   * Get all expenses with optional filtering
   */
  async getAll(query?: GetExpensesQuery): Promise<Expense[]> {
    const params: Record<string, string | number> = {};
    
    if (query?.budget_id) params.budget_id = query.budget_id;
    if (query?.from_date) params.from_date = query.from_date;
    if (query?.to_date) params.to_date = query.to_date;
    if (query?.recurring_month !== undefined && query.recurring_month !== null) {
      params.recurring_month = query.recurring_month;
    }
    if (query?.limit) params.limit = query.limit;
    if (query?.offset) params.offset = query.offset;
    
    const result = await apiClient.get<Expense[]>('/expenses', Object.keys(params).length ? params : undefined);
    return result.data || [];
  },

  /**
   * Get a single expense by ID
   */
  async getById(id: string): Promise<Expense | null> {
    if (!id) throw new Error('Expense ID is required');
    
    const result = await apiClient.get<Expense>(`/expenses/${id}`);
    return result.data || null;
  },

  /**
   * Create a new expense
   */
  async create(data: CreateExpenseRequest): Promise<Expense> {
    // Validate required fields
    if (!data.amount || data.amount <= 0) {
      throw new Error('Expense amount must be greater than 0');
    }
    
    if (!data.expense_date) {
      throw new Error('Expense date is required');
    }
    
    // Validate expense date is not in the future
    const expenseDate = new Date(data.expense_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (expenseDate > today) {
      throw new Error('Expense date cannot be in the future');
    }
    
    // Validate recurring month if provided
    if (data.recurring_month !== undefined && data.recurring_month !== null) {
      if (data.recurring_month < 1 || data.recurring_month > 12) {
        throw new Error('Recurring month must be between 1 and 12');
      }
    }
    
    // Validate description length if provided
    if (data.description && data.description.length > 500) {
      throw new Error('Description cannot exceed 500 characters');
    }
    
    const result = await apiClient.post<Expense>('/expenses', data);
    
    if (!result.data) {
      throw new Error('Failed to create expense');
    }
    
    return result.data;
  },

  /**
   * Update an existing expense
   */
  async update(id: string, data: UpdateExpenseRequest): Promise<Expense> {
    if (!id) throw new Error('Expense ID is required');
    
    // Validate fields if provided
    if (data.amount !== undefined && data.amount <= 0) {
      throw new Error('Expense amount must be greater than 0');
    }
    
    // Validate expense date if provided
    if (data.expense_date) {
      const expenseDate = new Date(data.expense_date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (expenseDate > today) {
        throw new Error('Expense date cannot be in the future');
      }
    }
    
    // Validate recurring month if provided
    if (data.recurring_month !== undefined && data.recurring_month !== null) {
      if (data.recurring_month < 1 || data.recurring_month > 12) {
        throw new Error('Recurring month must be between 1 and 12');
      }
    }
    
    // Validate description length if provided
    if (data.description && data.description.length > 500) {
      throw new Error('Description cannot exceed 500 characters');
    }
    
    const result = await apiClient.put<Expense>(`/expenses/${id}`, data);
    
    if (!result.data) {
      throw new Error('Failed to update expense');
    }
    
    return result.data;
  },

  /**
   * Delete an expense
   */
  async delete(id: string): Promise<void> {
    if (!id) throw new Error('Expense ID is required');
    
    await apiClient.delete(`/expenses/${id}`);
  },

  /**
   * Get expense summary with calculations
   */
  async getSummary(query?: GetExpensesQuery): Promise<ExpenseSummary> {
    const expenses = await this.getAll(query);
    
    const summary: ExpenseSummary = {
      total: 0,
      count: expenses.length,
      by_budget: {},
      by_month: {},
    };
    
    expenses.forEach(expense => {
      summary.total += expense.amount;
      
      // Group by budget
      const budgetKey = expense.budget_id || 'uncategorized';
      summary.by_budget![budgetKey] = (summary.by_budget![budgetKey] || 0) + expense.amount;
      
      // Group by month
      const monthKey = new Date(expense.expense_date).toISOString().substring(0, 7); // YYYY-MM format
      summary.by_month![monthKey] = (summary.by_month![monthKey] || 0) + expense.amount;
    });
    
    return summary;
  },
}; 