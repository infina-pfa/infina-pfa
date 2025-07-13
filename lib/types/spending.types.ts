/**
 * Spending Form Types
 * Interface definitions for the monthly spending form component
 */

export interface SpendingData {
  housing: number;
  food: number;
  transportation: number;
  other: number;
  total: number; // calculated field
}

export interface SpendingFormData {
  housing: number;
  food: number;
  transportation: number;
  other: number;
}

export interface SpendingFormProps {
  title: string;
  description: string;
  onUserSubmit: (spendingData: SpendingData) => void;
  initialData?: Partial<SpendingFormData>;
  isLoading?: boolean;
  disabled?: boolean;
}

export interface SpendingFormValidationErrors {
  housing?: string;
  food?: string;
  transportation?: string;
  other?: string;
}

export interface SpendingFormTouched {
  housing: boolean;
  food: boolean;
  transportation: boolean;
  other: boolean;
}

export interface UseSpendingFormReturn {
  formData: SpendingFormData;
  validationErrors: SpendingFormValidationErrors;
  touched: SpendingFormTouched;
  isFormValid: boolean;
  totalAmount: number;
  handleSubmit: (e: React.FormEvent) => void;
  handleInputChange: (field: keyof SpendingFormData, value: string) => void;
  handleFieldBlur: (field: keyof SpendingFormTouched) => void;
  reset: () => void;
}

export interface UseSpendingFormProps {
  onUserSubmit: (spendingData: SpendingData) => void;
  initialData?: Partial<SpendingFormData>;
  isLoading?: boolean;
}

// Constants for spending categories
export const SPENDING_CATEGORIES = {
  HOUSING: "housing",
  FOOD: "food",
  TRANSPORTATION: "transportation",
  OTHER: "other",
} as const;

export type SpendingCategory =
  (typeof SPENDING_CATEGORIES)[keyof typeof SPENDING_CATEGORIES];

// Validation rules specific to spending amounts
export const SPENDING_VALIDATION_RULES = {
  MIN_AMOUNT: 0,
  MAX_AMOUNT: 999999999999999, // Same as money input validation
} as const;
