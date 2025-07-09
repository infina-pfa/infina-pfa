import { Database } from "@/lib/supabase/database";

// Database types
export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type GoalInsert = Database["public"]["Tables"]["goals"]["Insert"];
export type GoalUpdate = Database["public"]["Tables"]["goals"]["Update"];

export type GoalTransaction =
  Database["public"]["Tables"]["goal_transactions"]["Row"];
export type GoalTransactionInsert =
  Database["public"]["Tables"]["goal_transactions"]["Insert"];

// Extended types for goal with transactions data
export type GoalWithTransactions = Goal & {
  transactions: Array<{
    id: string;
    name: string;
    amount: number;
    date: string;
    type: string;
    description: string | null;
  }>;
  progress: number; // Percentage of completion
};

// API Request/Response types
export interface CreateGoalRequest {
  title: string;
  target_amount?: number;
  current_amount?: number;
  description?: string;
  due_date?: string;
}

export interface UpdateGoalRequest {
  title?: string;
  target_amount?: number;
  current_amount?: number;
  description?: string;
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
  goalTransaction: GoalTransaction | null;
  error: string | null;
}
