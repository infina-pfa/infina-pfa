import { Database } from "@/lib/supabase/database";

// Database types
export type Budget = Database["public"]["Tables"]["budgets"]["Row"];
export type BudgetInsert = Database["public"]["Tables"]["budgets"]["Insert"];
export type BudgetUpdate = Database["public"]["Tables"]["budgets"]["Update"];

// API Request/Response types
export interface CreateBudgetRequest {
  month: number;
  year: number;
  name: string;
  color?: string;
  icon?: string;
  category?: string;
  amount?: number;
}

export interface UpdateBudgetRequest {
  name?: string;
  color?: string;
  icon?: string;
  category?: string;
  month?: number;
  year?: number;
  amount?: number;
}

export interface BudgetResponse {
  budget: Budget | null;
  error: string | null;
}

export interface BudgetListResponse {
  budgets: Budget[];
  error: string | null;
}

export interface BudgetFilters {
  month?: number;
  year?: number;
  category?: string;
}

export interface BudgetStats {
  totalBudgets: number;
  categoriesCount: number;
  monthlyBudgets: number;
  yearlyBudgets: number;
}

// Hook return types
export interface UseBudgetListReturn {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseBudgetCreateReturn {
  createBudget: (data: CreateBudgetRequest) => Promise<Budget | null>;
  isCreating: boolean;
  error: string | null;
}

export interface UseBudgetUpdateReturn {
  updateBudget: (id: string, data: UpdateBudgetRequest) => Promise<Budget | null>;
  isUpdating: boolean;
  error: string | null;
}

export interface UseBudgetDeleteReturn {
  deleteBudget: (id: string) => Promise<boolean>;
  isDeleting: boolean;
  error: string | null;
}

export interface UseBudgetDetailReturn {
  budget: Budget | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} 