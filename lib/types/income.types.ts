/**
 * Income Transaction Types
 * Defines all TypeScript interfaces for income management
 */

/**
 * Income transaction response from API
 */
export interface IncomeResponse {
  id: string;
  name: string;
  description: string;
  amount: number;
  type: 'income';
  recurring: number; // 0 = one-time, >0 = frequency in days
  createdAt: string;
  updatedAt: string;
}

/**
 * Request to create a new income
 */
export interface CreateIncomeRequest {
  name: string;
  amount: number;
  recurring: number;
}

/**
 * Request to update an existing income
 */
export interface UpdateIncomeRequest {
  name: string;
  amount: number;
  recurring: number;
}

/**
 * Filters for income queries
 */
export interface IncomeFilters {
  month?: number;
  year?: number;
}

/**
 * Common recurring patterns for income
 */
export const RECURRING_PATTERNS = {
  ONE_TIME: 0,
  WEEKLY: 7,
  BI_WEEKLY: 14,
  MONTHLY: 30,
  QUARTERLY: 90,
  SEMI_ANNUAL: 180,
  ANNUAL: 365,
} as const;

/**
 * Income categories for UI organization
 */
export enum IncomeCategory {
  SALARY = 'Salary',
  FREELANCE = 'Freelance',
  INVESTMENT = 'Investment',
  RENTAL = 'Rental',
  BUSINESS = 'Business',
  SIDE_HUSTLE = 'Side Hustle',
  DIVIDENDS = 'Dividends',
  ROYALTIES = 'Royalties',
  BONUS = 'Bonus',
  GIFT = 'Gift',
  OTHER = 'Other',
}

/**
 * Array of all income categories for iteration
 */
export const INCOME_CATEGORIES = Object.values(IncomeCategory);

export type RecurringPattern = typeof RECURRING_PATTERNS[keyof typeof RECURRING_PATTERNS];

// Alias for backward compatibility
export type Income = IncomeResponse;