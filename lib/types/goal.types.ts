import { Transaction } from "./transaction.types";

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  current_amount: number;
  target_amount: number | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  transactions?: Transaction[];
}

export interface CreateGoalRequest {
  title: string;
  description?: string;
  current_amount: number;
  target_amount?: number;
  due_date?: string;
}

export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  current_amount?: number;
  target_amount?: number;
  due_date?: string;
}

export interface GoalResponse {
  goal: Goal | null;
  error: string | null;
}

export interface GoalListResponse {
  goals: Goal[];
  error: string | null;
}

export interface GoalFilters {
  completed?: boolean;
  upcoming?: boolean; // Due soon
}

export interface GoalStats {
  totalGoals: number;
  completedGoals: number;
  upcomingGoals: number;
  totalSaved: number;
  averageCompletion: number; // Average progress percentage
}

// Hook return types
export interface UseGoalListReturn {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseGoalCreateReturn {
  createGoal: (data: CreateGoalRequest) => Promise<Goal | null>;
  isCreating: boolean;
  error: string | null;
}

export interface UseGoalUpdateReturn {
  updateGoal: (id: string, data: UpdateGoalRequest) => Promise<Goal | null>;
  isUpdating: boolean;
  error: string | null;
}

export interface UseGoalDeleteReturn {
  deleteGoal: (id: string) => Promise<boolean>;
  isDeleting: boolean;
  error: string | null;
}

export interface UseGoalDetailReturn {
  goal: Goal | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseGoalTransactionsReturn {
  transactions: Array<{
    id: string;
    name: string;
    amount: number;
    date: string;
    type: string;
    description: string | null;
  }>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface AddTransactionToGoalRequest {
  goalId: string;
  transactionId: string;
}

export interface AddTransactionToGoalResponse {
  success: boolean;
  goalTransaction: Transaction | null;
  error: string | null;
}

// Goal Transaction Income creation
export interface CreateGoalTransactionIncomeRequest {
  goalId: string;
  name: string;
  amount: number;
  description?: string;
  date?: string;
}

export interface CreateGoalTransactionIncomeResponse {
  success: boolean;
  data?: {
    transaction: Transaction;
    goalTransaction: {
      id: string;
      goal_id: string;
      transaction_id: string;
      user_id: string;
      created_at: string;
      updated_at: string;
    };
    updatedCurrentAmount: number;
  };
  error: string | null;
}

// Goal Transaction Withdrawal creation
export interface CreateGoalTransactionWithdrawalRequest {
  goalId: string;
  name: string;
  amount: number;
  description?: string;
  date?: string;
}

export interface CreateGoalTransactionWithdrawalResponse {
  success: boolean;
  data?: {
    transaction: Transaction;
    goalTransaction: {
      id: string;
      goal_id: string;
      transaction_id: string;
      user_id: string;
      created_at: string;
      updated_at: string;
    };
    updatedCurrentAmount: number;
  };
  error: string | null;
}

// Goal Income Transactions List
export interface GoalIncomeTransaction {
  id: string;
  goalTransactionId: string;
  transactionId: string;
  goalId: string;
  // Transaction details
  name: string;
  amount: number;
  description: string | null;
  type: string;
  recurring: number;
  date: string;
  createdAt: string;
  // Goal details
  goalTitle: string;
  goalDescription: string | null;
  goalCurrentAmount: number;
  goalTargetAmount: number | null;
}

export interface GoalIncomeTransactionFilters {
  month: number;
  year: number;
  goalId?: string;
}

export interface GoalIncomeTransactionsSummary {
  month: number;
  year: number;
  totalAmount: number;
  transactionCount: number;
  uniqueGoals: number;
}

export interface GoalIncomeTransactionsResponse {
  success: boolean;
  data?: {
    transactions: GoalIncomeTransaction[];
    summary: GoalIncomeTransactionsSummary;
  };
  error: string | null;
}

export enum DateStage {
  START_OF_MONTH = "start_of_month",
  END_OF_MONTH = "end_of_month",
  NORMAL_DAY = "normal_day",
  END_OF_WEEK = "end_of_week",
}
