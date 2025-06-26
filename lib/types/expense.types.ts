import { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database";

// Database types
export type Expense = Tables<"expenses">;
export type ExpenseInsert = TablesInsert<"expenses">;
export type ExpenseUpdate = TablesUpdate<"expenses">;

// API Request types
export interface CreateExpenseRequest {
  amount: number;
  budget_id?: string | null;
  description?: string | null;
  expense_date: string;
  recurring_month?: number | null;
}

export interface UpdateExpenseRequest {
  amount?: number;
  budget_id?: string | null;
  description?: string | null;
  expense_date?: string;
  recurring_month?: number | null;
}

export interface GetExpensesQuery {
  budget_id?: string;
  from_date?: string;
  to_date?: string;
  recurring_month?: number | null;
  limit?: number;
  offset?: number;
}

// API Response types
export interface ExpenseResponse {
  success: boolean;
  data?: Expense;
  error?: string;
  message?: string;
}

export interface ExpensesListResponse {
  success: boolean;
  data?: Expense[];
  error?: string;
  message?: string;
  total?: number;
}

// Expense validation schema
export const EXPENSE_VALIDATION = {
  amount: {
    min: 0.01,
    max: 999999999.99,
  },
  description: {
    maxLength: 500,
  },
  recurring_month: {
    min: 1,
    max: 12,
  },
} as const;

// Utility types for expense calculations
export interface ExpenseSummary {
  total: number;
  count: number;
  by_budget?: Record<string, number>;
  by_month?: Record<string, number>;
} 