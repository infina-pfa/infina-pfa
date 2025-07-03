export enum ErrorCode {
  // Auth
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_CONFIRMED = 'EMAIL_NOT_CONFIRMED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  EMAIL_NOT_FOUND = 'EMAIL_NOT_FOUND',
  PASSWORD_RESET_FAILED = 'PASSWORD_RESET_FAILED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Business Logic - Budgets
  BUDGET_NOT_FOUND = 'BUDGET_NOT_FOUND',
  DUPLICATE_BUDGET_NAME = 'DUPLICATE_BUDGET_NAME',
  BUDGET_LIMIT_EXCEEDED = 'BUDGET_LIMIT_EXCEEDED',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  BUDGET_NAME_REQUIRED = 'BUDGET_NAME_REQUIRED',
  BUDGET_NAME_TOO_LONG = 'BUDGET_NAME_TOO_LONG',
  INVALID_BUDGET_MONTH = 'INVALID_BUDGET_MONTH',
  INVALID_BUDGET_YEAR = 'INVALID_BUDGET_YEAR',
  
  // Business Logic - Expenses
  EXPENSE_NOT_FOUND = 'EXPENSE_NOT_FOUND',
  INVALID_EXPENSE_AMOUNT = 'INVALID_EXPENSE_AMOUNT',
  FUTURE_EXPENSE_DATE = 'FUTURE_EXPENSE_DATE',
  INVALID_RECURRING_MONTH = 'INVALID_RECURRING_MONTH',
  EXPENSE_DESCRIPTION_TOO_LONG = 'EXPENSE_DESCRIPTION_TOO_LONG',

  // Business Logic - Incomes
  INCOME_NOT_FOUND = 'INCOME_NOT_FOUND',
  INVALID_INCOME_AMOUNT = 'INVALID_INCOME_AMOUNT',
  INCOME_DESCRIPTION_REQUIRED = 'INCOME_DESCRIPTION_REQUIRED',
  INCOME_DESCRIPTION_TOO_LONG = 'INCOME_DESCRIPTION_TOO_LONG',
  INVALID_PAY_YOURSELF_PERCENT = 'INVALID_PAY_YOURSELF_PERCENT',

  // Business Logic - Conversations
  CONVERSATION_NOT_FOUND = 'CONVERSATION_NOT_FOUND',
  CONVERSATION_TITLE_REQUIRED = 'CONVERSATION_TITLE_REQUIRED',
  CONVERSATION_TITLE_TOO_LONG = 'CONVERSATION_TITLE_TOO_LONG',

  // Business Logic - Messages
  MESSAGE_NOT_FOUND = 'MESSAGE_NOT_FOUND',
  MESSAGE_CONTENT_REQUIRED = 'MESSAGE_CONTENT_REQUIRED',
  MESSAGE_CONTENT_TOO_LONG = 'MESSAGE_CONTENT_TOO_LONG',
  INVALID_SENDER_TYPE = 'INVALID_SENDER_TYPE',
  
  // Network & Server
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
  
  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Translation key mapping for error codes
export const ERROR_TRANSLATION_KEYS: Record<ErrorCode, string> = {
  [ErrorCode.UNAUTHORIZED]: 'errorUnauthorized',
  [ErrorCode.INVALID_CREDENTIALS]: 'errorInvalidCredentials',
  [ErrorCode.EMAIL_NOT_CONFIRMED]: 'errorEmailNotConfirmed',
  [ErrorCode.TOKEN_EXPIRED]: 'errorTokenExpired',
  [ErrorCode.EMAIL_NOT_FOUND]: 'errorEmailNotFound',
  [ErrorCode.PASSWORD_RESET_FAILED]: 'errorPasswordResetFailed',
  
  [ErrorCode.VALIDATION_ERROR]: 'errorValidation',
  [ErrorCode.REQUIRED_FIELD]: 'errorRequiredField',
  [ErrorCode.INVALID_FORMAT]: 'errorInvalidFormat',
  
  [ErrorCode.BUDGET_NOT_FOUND]: 'errorBudgetNotFound',
  [ErrorCode.DUPLICATE_BUDGET_NAME]: 'errorDuplicateBudgetName',
  [ErrorCode.BUDGET_LIMIT_EXCEEDED]: 'errorBudgetLimitExceeded',
  [ErrorCode.INVALID_DATE_RANGE]: 'errorInvalidDateRange',
  [ErrorCode.BUDGET_NAME_REQUIRED]: 'errorBudgetNameRequired',
  [ErrorCode.BUDGET_NAME_TOO_LONG]: 'errorBudgetNameTooLong',
  [ErrorCode.INVALID_BUDGET_MONTH]: 'errorInvalidBudgetMonth',
  [ErrorCode.INVALID_BUDGET_YEAR]: 'errorInvalidBudgetYear',
  
  [ErrorCode.EXPENSE_NOT_FOUND]: 'errorExpenseNotFound',
  [ErrorCode.INVALID_EXPENSE_AMOUNT]: 'errorInvalidExpenseAmount',
  [ErrorCode.FUTURE_EXPENSE_DATE]: 'errorFutureExpenseDate',
  [ErrorCode.INVALID_RECURRING_MONTH]: 'errorInvalidRecurringMonth',
  [ErrorCode.EXPENSE_DESCRIPTION_TOO_LONG]: 'errorExpenseDescriptionTooLong',
  
  [ErrorCode.INCOME_NOT_FOUND]: 'errorIncomeNotFound',
  [ErrorCode.INVALID_INCOME_AMOUNT]: 'errorInvalidIncomeAmount',
  [ErrorCode.INCOME_DESCRIPTION_REQUIRED]: 'errorIncomeDescriptionRequired',
  [ErrorCode.INCOME_DESCRIPTION_TOO_LONG]: 'errorIncomeDescriptionTooLong',
  [ErrorCode.INVALID_PAY_YOURSELF_PERCENT]: 'errorInvalidPayYourselfPercent',
  
  [ErrorCode.CONVERSATION_NOT_FOUND]: 'errorConversationNotFound',
  [ErrorCode.CONVERSATION_TITLE_REQUIRED]: 'errorConversationTitleRequired',
  [ErrorCode.CONVERSATION_TITLE_TOO_LONG]: 'errorConversationTitleTooLong',
  
  [ErrorCode.MESSAGE_NOT_FOUND]: 'errorMessageNotFound',
  [ErrorCode.MESSAGE_CONTENT_REQUIRED]: 'errorMessageContentRequired',
  [ErrorCode.MESSAGE_CONTENT_TOO_LONG]: 'errorMessageContentTooLong',
  [ErrorCode.INVALID_SENDER_TYPE]: 'errorInvalidSenderType',
  
  [ErrorCode.NETWORK_ERROR]: 'errorNetworkError',
  [ErrorCode.SERVER_ERROR]: 'errorServerError',
  [ErrorCode.TIMEOUT]: 'errorTimeout',
  
  [ErrorCode.UNKNOWN_ERROR]: 'errorUnknownError'
};

// Fallback error messages for when translation is not available
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.UNAUTHORIZED]: 'Please sign in to continue',
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password',
  [ErrorCode.EMAIL_NOT_CONFIRMED]: 'Please check your email and click the confirmation link',
  [ErrorCode.TOKEN_EXPIRED]: 'Your session has expired. Please sign in again',
  [ErrorCode.EMAIL_NOT_FOUND]: 'No account found with this email address',
  [ErrorCode.PASSWORD_RESET_FAILED]: 'Failed to reset password. Please try again',
  
  [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again',
  [ErrorCode.REQUIRED_FIELD]: 'This field is required',
  [ErrorCode.INVALID_FORMAT]: 'Please enter a valid value',
  
  [ErrorCode.BUDGET_NOT_FOUND]: 'Budget not found',
  [ErrorCode.DUPLICATE_BUDGET_NAME]: 'A budget with this name already exists',
  [ErrorCode.BUDGET_LIMIT_EXCEEDED]: 'You have reached the maximum number of budgets',
  [ErrorCode.INVALID_DATE_RANGE]: 'End date must be after start date',
  [ErrorCode.BUDGET_NAME_REQUIRED]: 'Budget name is required',
  [ErrorCode.BUDGET_NAME_TOO_LONG]: 'Budget name cannot exceed 100 characters',
  [ErrorCode.INVALID_BUDGET_MONTH]: 'Month must be between 1 and 12',
  [ErrorCode.INVALID_BUDGET_YEAR]: 'Please enter a valid year',
  
  [ErrorCode.EXPENSE_NOT_FOUND]: 'Expense not found',
  [ErrorCode.INVALID_EXPENSE_AMOUNT]: 'Expense amount must be greater than 0',
  [ErrorCode.FUTURE_EXPENSE_DATE]: 'Expense date cannot be in the future',
  [ErrorCode.INVALID_RECURRING_MONTH]: 'Recurring month must be between 1 and 12',
  [ErrorCode.EXPENSE_DESCRIPTION_TOO_LONG]: 'Description cannot exceed 500 characters',
  
  [ErrorCode.INCOME_NOT_FOUND]: 'Income not found',
  [ErrorCode.INVALID_INCOME_AMOUNT]: 'Income amount must be greater than 0',
  [ErrorCode.INCOME_DESCRIPTION_REQUIRED]: 'Income description is required',
  [ErrorCode.INCOME_DESCRIPTION_TOO_LONG]: 'Description cannot exceed 500 characters',
  [ErrorCode.INVALID_PAY_YOURSELF_PERCENT]: 'Pay yourself percent must be between 0 and 100',
  
  [ErrorCode.CONVERSATION_NOT_FOUND]: 'Conversation not found',
  [ErrorCode.CONVERSATION_TITLE_REQUIRED]: 'Conversation title is required',
  [ErrorCode.CONVERSATION_TITLE_TOO_LONG]: 'Title cannot exceed 255 characters',
  
  [ErrorCode.MESSAGE_NOT_FOUND]: 'Message not found',
  [ErrorCode.MESSAGE_CONTENT_REQUIRED]: 'Message content is required',
  [ErrorCode.MESSAGE_CONTENT_TOO_LONG]: 'Message content cannot exceed 10,000 characters',
  [ErrorCode.INVALID_SENDER_TYPE]: 'Sender type must be either BOT or USER',
  
  [ErrorCode.NETWORK_ERROR]: 'Please check your internet connection and try again',
  [ErrorCode.SERVER_ERROR]: 'Something went wrong on our end. Please try again',
  [ErrorCode.TIMEOUT]: 'Request timed out. Please try again',
  
  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred'
}; 