import { Transaction } from "./transaction.types";

// Database types - Income is a transaction with type "income"
export type Income = Transaction & {
  type: "income";
};

// API Request/Response types
export interface CreateIncomeRequest {
  name: string;
  amount: number;
  description?: string; // Will contain category info
  recurring?: number; // 0 = one-time, 1 = daily, 7 = weekly, 30 = monthly, etc.
}

export interface UpdateIncomeRequest {
  name?: string;
  amount?: number;
  description?: string;
  recurring?: number;
}

export interface IncomeResponse {
  income: Income | null;
  error: string | null;
}

export interface IncomeListResponse {
  incomes: Income[];
  error: string | null;
}

export interface IncomeFilters {
  month?: number;
  year?: number;
  category?: string;
  recurring?: boolean; // Filter for recurring vs one-time incomes
}

export interface IncomeStats {
  totalIncomes: number;
  monthlyTotal: number;
  yearlyTotal: number;
  recurringTotal: number;
  oneTimeTotal: number;
  averageMonthly: number;
  categoriesCount: number;
}

export interface IncomeAnalytics {
  monthlyIncomes: Array<{
    month: string;
    total: number;
    count: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    total: number;
    percentage: number;
  }>;
  recurringVsOneTime: {
    recurring: number;
    oneTime: number;
  };
}

// Income categories that will be stored in description
export const INCOME_CATEGORIES = {
  SALARY: "Salary",
  FREELANCE: "Freelance",
  INVESTMENT: "Investment",
  BUSINESS: "Business",
  BONUS: "Bonus",
  GIFT: "Gift",
  OTHER: "Other",
} as const;

export type IncomeCategory =
  (typeof INCOME_CATEGORIES)[keyof typeof INCOME_CATEGORIES];

// Hook return types
export interface UseIncomeListReturn {
  incomes: Income[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseIncomeCreateReturn {
  createIncome: (data: CreateIncomeRequest) => Promise<Income | null>;
  isCreating: boolean;
  error: string | null;
}

export interface UseIncomeUpdateReturn {
  updateIncome: (
    id: string,
    data: UpdateIncomeRequest
  ) => Promise<Income | null>;
  isUpdating: boolean;
  error: string | null;
}

export interface UseIncomeDeleteReturn {
  deleteIncome: (id: string) => Promise<boolean>;
  isDeleting: boolean;
  error: string | null;
}

export interface UseIncomeStatsReturn {
  stats: IncomeStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseIncomeAnalyticsReturn {
  analytics: IncomeAnalytics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
