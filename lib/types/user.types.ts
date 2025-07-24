export interface FinancialMetadata {
  weekSpending: number[]; // 4 weeks data: [500000, 600000, 700000, 800000]
  dateGetSalary: string;
  payYourselfFirstAmount: number;
  monthlyIncome: number;
}

export enum BudgetStyle {
  DETAIL_TRACKER = "detail_tracker",
  GOAL_FOCUSED = "goal_focused",
}

export enum FinancialStage {
  DEBT = "debt",
  START_SAVING = "start_saving",
  START_INVESTING = "start_investing",
}

// Database row type - matches exactly what comes from Supabase
export interface User {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  user_id: string;
  total_asset_value: number;
  onboarding_completed_at?: string | null;
  financial_metadata?: FinancialMetadata | null;
  financial_stage?: string | null;
  budgeting_style?: "detail_tracker" | "goal_focused" | null;
}

// Insert type for creating users
export interface UserInsert {
  name: string;
  user_id: string;
  total_asset_value?: number;
  financial_metadata?: FinancialMetadata | null;
  financial_stage?: string | null;
  budgeting_style?: "detail_tracker" | "goal_focused" | null;
}

// Update type for updating users
export interface UserUpdate {
  name?: string;
  total_asset_value?: number;
  financial_stage?: string;
  budgeting_style?: "detail_tracker" | "goal_focused";
  financial_metadata?: FinancialMetadata | null;
  onboarding_completed_at?: string | null;
  updated_at?: string;
}

// User creation request from frontend
export interface CreateUserRequest {
  name: string;
}

// Client-side user profile with typed metadata
export interface UserProfile {
  id: string;
  name: string;
  user_id: string;
  total_asset_value: number;
  onboarding_completed_at?: string | null;
  financial_stage?: string | null;
  financial_metadata?: FinancialMetadata | null;
  budgeting_style?: "detail_tracker" | "goal_focused" | null;
  created_at: string;
  updated_at: string;
}

// User service response types
export interface UserResponse {
  user: UserProfile | null;
  error: string | null;
}

export interface UserCheckResponse {
  exists: boolean;
  user: UserProfile | null;
  error: string | null;
}

// Legacy types for backward compatibility
export type BudgetingStyle = "detail_tracker" | "goal_focused";
export type FinancialStageType = "debt" | "start_saving" | "start_investing";
