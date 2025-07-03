import { Database } from "@/lib/supabase/database";

// Database types
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
export type TransactionUpdate = Database["public"]["Tables"]["transactions"]["Update"];
export type TransactionType = Database["public"]["Enums"]["transaction_type"];

export type BudgetTransaction = Database["public"]["Tables"]["budget_transactions"]["Row"];
export type BudgetTransactionInsert = Database["public"]["Tables"]["budget_transactions"]["Insert"];

// API Request/Response types
export interface CreateExpenseRequest {
  name: string;
  amount: number;
  description?: string;
  budgetId: string;
  date?: string;
}

export interface UpdateExpenseRequest {
  name?: string;
  amount?: number;
  description?: string;
  date?: string;
}

export interface CreateTransactionRequest {
  name: string;
  amount: number;
  description?: string;
  type: TransactionType;
  recurring?: number;
}

export interface UpdateTransactionRequest {
  name?: string;
  amount?: number;
  description?: string;
  date?: string;
}

export interface TransactionResponse {
  transaction: Transaction | null;
  error: string | null;
}

export interface TransactionListResponse {
  transactions: Array<Transaction & { 
    budgetName?: string; 
    budgetColor?: string;
  }>;
  error: string | null;
}

export interface CreateExpenseResponse {
  transaction: Transaction | null;
  budgetTransaction: BudgetTransaction | null;
  error: string | null;
}

export interface UpdateExpenseResponse {
  transaction: Transaction | null;
  error: string | null;
}

// Extended types for display
export interface ExpenseWithBudget extends Transaction {
  budget?: {
    id: string;
    name: string;
    category: string;
    color: string;
  };
}

// Hook return types
export interface UseTransactionCreateReturn {
  createTransaction: (data: CreateTransactionRequest) => Promise<Transaction | null>;
  isCreating: boolean;
  error: string | null;
}

export interface UseExpenseCreateReturn {
  createExpense: (data: CreateExpenseRequest) => Promise<{ transaction: Transaction; budgetTransaction: BudgetTransaction } | null>;
  isCreating: boolean;
  error: string | null;
}

export interface UseExpenseUpdateReturn {
  updateExpense: (id: string, data: UpdateExpenseRequest) => Promise<Transaction | null>;
  isUpdating: boolean;
  error: string | null;
}

export interface UseTransactionListReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} 