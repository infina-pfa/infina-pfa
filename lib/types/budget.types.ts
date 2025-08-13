export enum BudgetCategory {
  FIXED = "fixed",
  FLEXIBLE = "flexible",
}

export enum TransactionType {
  INCOME = "income",
  BUDGET_SPENDING = "budget_spending",
  GOAL_CONTRIBUTION = "goal_contribution",
  GOAL_WITHDRAWAL = "goal_withdrawal",
}

export enum BudgetErrorCode {
  BUDGET_NOT_FOUND = "BUDGET_NOT_FOUND",
  BUDGET_INVALID_AMOUNT = "BUDGET_INVALID_AMOUNT",
  SPENDING_NOT_FOUND = "SPENDING_NOT_FOUND",
  INCOME_NOT_FOUND = "INCOME_NOT_FOUND",
}

export interface CreateBudgetRequest {
  name: string;
  amount: number;
  category: BudgetCategory;
  color: string;
  icon: string;
  month: number;
  year: number;
}

export interface UpdateBudgetRequest {
  name?: string;
  amount?: number;
  category?: BudgetCategory;
  color?: string;
  icon?: string;
}

export interface SpendRequest {
  amount: number;
  name?: string;
  description?: string;
  recurring?: number;
}

export interface BudgetResponse {
  id: string;
  name: string;
  amount: number;
  userId: string;
  category: BudgetCategory;
  color: string;
  icon: string;
  month: number;
  year: number;
  spent: number;
  createdAt: string;
  updatedAt: string;
  transactions?: TransactionResponse[];
}

export interface TransactionResponse {
  id: string;
  name: string;
  description: string;
  amount: number;
  type: TransactionType;
  recurring: number;
  createdAt: string;
  updatedAt: string;
  budget: Omit<BudgetResponse, "spent" | "transactions">;
}

export interface BudgetDetailResponse extends BudgetResponse {
  transactions: TransactionResponse[];
}

export interface GetBudgetsQuery {
  month: number;
  year: number;
}

export interface MonthlySpendingQuery {
  month: number;
  year: number;
}

// Alias types for backward compatibility with existing components
export type Budget = BudgetResponse;
export type BudgetWithSpending = BudgetResponse;

// Filter types
export interface BudgetFilters {
  category?: BudgetCategory;
  month?: number;
  year?: number;
}

// List response types
export interface BudgetListResponse {
  budgets: BudgetResponse[];
  error: string | null;
}

// Hook return types
export interface UseBudgetListReturn {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseBudgetUpdateReturn {
  updateBudget: (
    budgetId: string,
    data: UpdateBudgetRequest
  ) => Promise<BudgetResponse | null>;
  loading: boolean;
  error: string | null;
}

export interface UseBudgetCreateReturn {
  createBudget: (data: CreateBudgetRequest) => Promise<BudgetResponse | null>;
  loading: boolean;
  error: string | null;
}

export interface UseBudgetDeleteReturn {
  deleteBudget: (budgetId: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export interface UseBudgetDetailReturn {
  budget: BudgetResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
