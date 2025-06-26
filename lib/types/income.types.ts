import { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database";

// Database types
export type Income = Tables<"incomes">;
export type IncomeInsert = TablesInsert<"incomes">;
export type IncomeUpdate = TablesUpdate<"incomes">;

// API Request types
export interface CreateIncomeRequest {
  amount: number;
  date: string;
  description: string;
  is_recurring?: boolean | null;
  pay_yourself_percent?: number | null;
}

export interface UpdateIncomeRequest {
  amount?: number;
  date?: string;
  description?: string;
  is_recurring?: boolean | null;
  pay_yourself_percent?: number | null;
}

export interface GetIncomesQuery {
  from_date?: string;
  to_date?: string;
  is_recurring?: boolean | null;
  limit?: number;
  offset?: number;
}

// API Response types
export interface IncomeResponse {
  success: boolean;
  data?: Income;
  error?: string;
  message?: string;
}

export interface IncomesListResponse {
  success: boolean;
  data?: Income[];
  error?: string;
  message?: string;
  total?: number;
}

// Income validation schema
export const INCOME_VALIDATION = {
  amount: {
    min: 0.01,
    max: 999999999.99,
  },
  description: {
    minLength: 1,
    maxLength: 500,
  },
  pay_yourself_percent: {
    min: 0,
    max: 100,
  },
} as const;

// Utility types for income calculations
export interface IncomeSummary {
  total: number;
  count: number;
  recurring_total?: number;
  one_time_total?: number;
  by_month?: Record<string, number>;
  average_pay_yourself_percent?: number;
} 