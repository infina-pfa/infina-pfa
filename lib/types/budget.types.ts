import { Tables, TablesInsert, TablesUpdate, Enums } from "@/lib/supabase/database";

// Database types
export type Budget = Tables<"budgets">;
export type BudgetInsert = TablesInsert<"budgets">;
export type BudgetUpdate = TablesUpdate<"budgets">;
export type BudgetCategory = Enums<"budget_category">;

// API Request types
export interface CreateBudgetRequest {
  name: string;
  amount: number;
  category?: BudgetCategory;
  color: string;
  icon: string;
  started_at?: string;
  ended_at: string;
}

export interface UpdateBudgetRequest {
  name?: string;
  amount?: number;
  category?: BudgetCategory;
  color?: string;
  icon?: string;
  started_at?: string;
  ended_at?: string;
}

export interface GetBudgetsQuery {
  category?: BudgetCategory;
  limit?: number;
  offset?: number;
}

// API Response types
export interface BudgetResponse {
  success: boolean;
  data?: Budget;
  error?: string;
  message?: string;
}

export interface BudgetsListResponse {
  success: boolean;
  data?: Budget[];
  error?: string;
  message?: string;
  total?: number;
}

// Budget validation schema
export const BUDGET_CATEGORIES: BudgetCategory[] = ["fixed", "flexible", "planed"];

export const BUDGET_VALIDATION = {
  name: {
    minLength: 1,
    maxLength: 255,
  },
  amount: {
    min: 0.01,
    max: 999999999.99,
  },
  color: {
    pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, // Hex color validation
  },
} as const; 