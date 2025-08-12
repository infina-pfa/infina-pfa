export enum GoalErrorCode {
  INVALID_GOAL = "INVALID_GOAL",
  GOAL_NOT_FOUND = "GOAL_NOT_FOUND",
  GOAL_INVALID_TARGET_AMOUNT = "GOAL_INVALID_TARGET_AMOUNT",
  GOAL_INVALID_DUE_DATE = "GOAL_INVALID_DUE_DATE",
  GOAL_TITLE_ALREADY_EXISTS = "GOAL_TITLE_ALREADY_EXISTS",
  GOAL_INSUFFICIENT_BALANCE = "GOAL_INSUFFICIENT_BALANCE",
}

export enum GoalTransactionType {
  GOAL_CONTRIBUTION = "goal_contribution",
  GOAL_WITHDRAWAL = "goal_withdrawal",
}

export interface CreateGoalRequest {
  title: string;
  description?: string;
  targetAmount?: number;
  dueDate?: string;
}

export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  targetAmount?: number;
  dueDate?: string;
}

export interface ContributeGoalRequest {
  amount: number;
  name?: string;
  description?: string;
  recurring?: number;
}

export interface WithdrawGoalRequest {
  amount: number;
  name?: string;
  description?: string;
  recurring?: number;
}

export interface TransactionResponseDto {
  id: string;
  name: string;
  description: string;
  amount: number;
  type: GoalTransactionType;
  recurring: number;
  createdAt: string;
  updatedAt: string;
}

export interface GoalResponseDto {
  id: string;
  title: string;
  description?: string;
  currentAmount: number;
  targetAmount?: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  remainingAmount: number;
  transactions: TransactionResponseDto[];
}

// Alias for backward compatibility
export type Goal = GoalResponseDto;