export enum BudgetStyle {
  DETAIL_TRACKER = "detail_tracker",
  GOAL_FOCUSED = "goal_focused",
}

export enum FinancialStage {
  DEBT = "debt",
  START_SAVING = "start_saving",
  START_INVESTING = "start_investing",
}

export interface User {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  user_id: string;
  total_asset_value: number;
  onboarding_completed_at?: string;
  financial_stage?: FinancialStage;
  budget_style?: BudgetStyle;
}

export interface UserInsert {
  name: string;
  user_id: string;
  total_asset_value?: number;
}

export interface UserUpdate {
  name?: string;
  total_asset_value?: number;
  financial_stage?: FinancialStage;
  budget_style?: BudgetStyle;
  updated_at?: string;
}

// User creation request
export interface CreateUserRequest {
  name: string;
}

// User profile response
export interface UserProfile {
  id: string;
  name: string;
  user_id: string;
  total_asset_value: number;
  onboarding_completed_at?: string;
  financial_stage?: FinancialStage;
  budget_style?: BudgetStyle;
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
