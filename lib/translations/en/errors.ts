export const errorsEn = {
  // Budget Error Codes
  BUDGET_ALREADY_EXISTS: "Budget already exists for this month",
  BUDGET_NOT_FOUND: "Budget not found",
  INVALID_BUDGET_AMOUNT: "Invalid budget amount",
  BUDGET_LIMIT_EXCEEDED: "You have reached the maximum number of budgets",
  INSUFFICIENT_BUDGET: "Insufficient budget for this expense",
  BUDGET_UPDATE_FAILED: "Failed to update budget",
  BUDGET_DELETE_FAILED: "Failed to delete budget",
  BUDGET_CREATE_FAILED: "Failed to create budget",

  // Transaction Error Codes
  TRANSACTION_NOT_FOUND: "Transaction not found",
  INVALID_TRANSACTION_AMOUNT: "Invalid transaction amount",
  TRANSACTION_UPDATE_FAILED: "Failed to update transaction",
  TRANSACTION_DELETE_FAILED: "Failed to delete transaction",
  TRANSACTION_CREATE_FAILED: "Failed to create transaction",

  // General Error Codes
  UNAUTHORIZED: "You are not authorized to perform this action",
  FORBIDDEN: "This action is forbidden",
  VALIDATION_ERROR: "Please check your input and try again",
  INTERNAL_SERVER_ERROR: "Something went wrong. Please try again later",
  BAD_REQUEST: "Invalid request",
  NOT_FOUND: "Resource not found",
  CONFLICT: "This action conflicts with existing data",
  TOO_MANY_REQUESTS: "Too many requests. Please slow down",
  SERVICE_UNAVAILABLE: "Service temporarily unavailable",
  SAME_PASSWORD: "New password cannot be the same as the old password",
  PASSWORD_UPDATE_SUCCESS: "Password updated successfully",
  PASSWORD_UPDATE_FAILED: "Failed to update password. Please try again",
  
  // Network Error Codes
  NETWORK_ERROR: "Network error. Please check your connection",
  TIMEOUT_ERROR: "Request timed out. Please try again",
  CONNECTION_ERROR: "Unable to connect to server",

  // Auth Error Codes
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_NOT_FOUND: "User not found",
  EMAIL_ALREADY_EXISTS: "Email already exists",
  INVALID_TOKEN: "Invalid or expired token",
  SESSION_EXPIRED: "Your session has expired. Please sign in again",

  // Validation Error Codes
  REQUIRED_FIELD: "This field is required",
  INVALID_EMAIL: "Invalid email format",
  PASSWORD_TOO_SHORT: "Password must be at least 6 characters",
  INVALID_DATE: "Invalid date",
  INVALID_MONTH: "Invalid month",
  INVALID_YEAR: "Invalid year",

  // Goal Error Codes
  INVALID_GOAL: "Invalid goal data",
  GOAL_NOT_FOUND: "Goal not found",
  GOAL_INVALID_TARGET_AMOUNT: "Invalid target amount",
  GOAL_INVALID_DUE_DATE: "Invalid due date",
  GOAL_TITLE_ALREADY_EXISTS: "A goal with this title already exists",
  GOAL_INSUFFICIENT_BALANCE: "Insufficient balance to withdraw",

  // Default fallback
  UNKNOWN_ERROR: "An unexpected error occurred",
};
