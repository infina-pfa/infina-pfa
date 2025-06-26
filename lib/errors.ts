export enum ErrorCode {
  // Auth
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_CONFIRMED = 'EMAIL_NOT_CONFIRMED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Business Logic - Budgets
  BUDGET_NOT_FOUND = 'BUDGET_NOT_FOUND',
  DUPLICATE_BUDGET_NAME = 'DUPLICATE_BUDGET_NAME',
  BUDGET_LIMIT_EXCEEDED = 'BUDGET_LIMIT_EXCEEDED',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  
  // Business Logic - Expenses
  EXPENSE_NOT_FOUND = 'EXPENSE_NOT_FOUND',
  INVALID_EXPENSE_AMOUNT = 'INVALID_EXPENSE_AMOUNT',
  FUTURE_EXPENSE_DATE = 'FUTURE_EXPENSE_DATE',
  INVALID_RECURRING_MONTH = 'INVALID_RECURRING_MONTH',
  EXPENSE_DESCRIPTION_TOO_LONG = 'EXPENSE_DESCRIPTION_TOO_LONG',
  
  // Network & Server
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
  
  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.UNAUTHORIZED]: 'Please sign in to continue',
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password',
  [ErrorCode.EMAIL_NOT_CONFIRMED]: 'Please check your email and click the confirmation link',
  [ErrorCode.TOKEN_EXPIRED]: 'Your session has expired. Please sign in again',
  
  [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again',
  [ErrorCode.REQUIRED_FIELD]: 'This field is required',
  [ErrorCode.INVALID_FORMAT]: 'Please enter a valid value',
  
  [ErrorCode.BUDGET_NOT_FOUND]: 'Budget not found',
  [ErrorCode.DUPLICATE_BUDGET_NAME]: 'A budget with this name already exists',
  [ErrorCode.BUDGET_LIMIT_EXCEEDED]: 'You have reached the maximum number of budgets',
  [ErrorCode.INVALID_DATE_RANGE]: 'End date must be after start date',
  
  [ErrorCode.EXPENSE_NOT_FOUND]: 'Expense not found',
  [ErrorCode.INVALID_EXPENSE_AMOUNT]: 'Expense amount must be greater than 0',
  [ErrorCode.FUTURE_EXPENSE_DATE]: 'Expense date cannot be in the future',
  [ErrorCode.INVALID_RECURRING_MONTH]: 'Recurring month must be between 1 and 12',
  [ErrorCode.EXPENSE_DESCRIPTION_TOO_LONG]: 'Description cannot exceed 500 characters',
  
  [ErrorCode.NETWORK_ERROR]: 'Please check your internet connection and try again',
  [ErrorCode.SERVER_ERROR]: 'Something went wrong on our end. Please try again',
  [ErrorCode.TIMEOUT]: 'Request timed out. Please try again',
  
  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred'
}; 