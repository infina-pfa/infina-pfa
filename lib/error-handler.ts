import { AuthError } from '@supabase/supabase-js';
import { ErrorCode, ERROR_MESSAGES, ERROR_TRANSLATION_KEYS } from './errors';
import { ChatError } from "@/lib/types/chat.types";

export interface AppError {
  code: ErrorCode;
  message: string;
  originalError?: Error;
}

// Type for translation function
type TranslationFunction = (key: string) => string;

// Main error handler that uses translation keys when available
export const handleError = (error: unknown, t?: TranslationFunction): AppError => {
  const errorResult = getErrorCode(error);
  const message = t ? t(ERROR_TRANSLATION_KEYS[errorResult.code]) : ERROR_MESSAGES[errorResult.code];
  
  return {
    ...errorResult,
    message,
  };
};

// Helper function to determine error code
const getErrorCode = (error: unknown): { code: ErrorCode; originalError?: Error } => {
  // Handle Supabase Auth Errors
  if (error instanceof AuthError) {
    const message = error.message.toLowerCase();
    
    if (message.includes('invalid login credentials')) {
      return { 
        code: ErrorCode.INVALID_CREDENTIALS,
        originalError: error
      };
    }
    
    if (message.includes('email not confirmed')) {
      return { 
        code: ErrorCode.EMAIL_NOT_CONFIRMED,
        originalError: error
      };
    }
    
    if (message.includes('jwt expired') || message.includes('token expired')) {
      return { 
        code: ErrorCode.TOKEN_EXPIRED,
        originalError: error
      };
    }
    
    return { 
      code: ErrorCode.UNAUTHORIZED,
      originalError: error
    };
  }

  // Handle Network Errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return { 
      code: ErrorCode.NETWORK_ERROR,
      originalError: error
    };
  }

  // Handle API Response Errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Check for validation errors
    if (message.includes('validation') || message.includes('required') || message.includes('invalid')) {
      return { 
        code: ErrorCode.VALIDATION_ERROR,
        originalError: error
      };
    }
    
    // Check for not found errors
    if (message.includes('income not found')) {
      return { 
        code: ErrorCode.INCOME_NOT_FOUND,
        originalError: error
      };
    }
    
    if (message.includes('expense not found')) {
      return { 
        code: ErrorCode.EXPENSE_NOT_FOUND,
        originalError: error
      };
    }
    
    if (message.includes('budget not found') || message.includes('not found')) {
      return { 
        code: ErrorCode.BUDGET_NOT_FOUND,
        originalError: error
      };
    }
    
    // Check for duplicate errors
    if (message.includes('duplicate') || message.includes('already exists')) {
      return { 
        code: ErrorCode.DUPLICATE_BUDGET_NAME,
        originalError: error
      };
    }
    
    // Check for income-specific errors
    if (message.includes('income amount must be greater than 0') || (message.includes('amount must be greater than 0') && message.includes('income'))) {
      return { 
        code: ErrorCode.INVALID_INCOME_AMOUNT,
        originalError: error
      };
    }
    
    if (message.includes('income description is required') || message.includes('description is required')) {
      return { 
        code: ErrorCode.INCOME_DESCRIPTION_REQUIRED,
        originalError: error
      };
    }
    
    if (message.includes('pay yourself percent must be between 0 and 100')) {
      return { 
        code: ErrorCode.INVALID_PAY_YOURSELF_PERCENT,
        originalError: error
      };
    }
    
    // Check for expense-specific errors
    if (message.includes('expense amount must be greater than 0') || (message.includes('amount must be greater than 0') && message.includes('expense'))) {
      return { 
        code: ErrorCode.INVALID_EXPENSE_AMOUNT,
        originalError: error
      };
    }
    
    if (message.includes('expense date cannot be in the future') || message.includes('future')) {
      return { 
        code: ErrorCode.FUTURE_EXPENSE_DATE,
        originalError: error
      };
    }
    
    if (message.includes('recurring month must be between')) {
      return { 
        code: ErrorCode.INVALID_RECURRING_MONTH,
        originalError: error
      };
    }
    
    if (message.includes('description cannot exceed 500 characters')) {
      return { 
        code: ErrorCode.EXPENSE_DESCRIPTION_TOO_LONG,
        originalError: error
      };
    }
    
    // Check for date validation errors
    if (message.includes('date') && (message.includes('invalid') || message.includes('before') || message.includes('after'))) {
      return { 
        code: ErrorCode.INVALID_DATE_RANGE,
        originalError: error
      };
    }
    
    // Check for server errors
    if (message.includes('500') || message.includes('internal server error')) {
      return { 
        code: ErrorCode.SERVER_ERROR,
        originalError: error
      };
    }
    
    // Check for unauthorized
    if (message.includes('401') || message.includes('unauthorized')) {
      return { 
        code: ErrorCode.UNAUTHORIZED,
        originalError: error
      };
    }
    
    // Default to server error for other Error instances
    return { 
      code: ErrorCode.SERVER_ERROR,
      originalError: error 
    };
  }

  // Handle unknown errors
  return { 
    code: ErrorCode.UNKNOWN_ERROR 
  };
};

// Error codes for different types of errors
export const ERROR_CODES = {
  // Authentication errors
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  
  // Validation errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  
  // API errors
  API_ERROR: "API_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  
  // Chat specific errors
  SESSION_CREATE_FAILED: "SESSION_CREATE_FAILED",
  MESSAGE_SEND_FAILED: "MESSAGE_SEND_FAILED",
  STREAMING_ERROR: "STREAMING_ERROR",
  
  // Database errors
  DATABASE_ERROR: "DATABASE_ERROR",
  RECORD_NOT_FOUND: "RECORD_NOT_FOUND",
  
  // Generic errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR"
} as const;

// User-friendly error messages
export const ERROR_MESSAGES = {
  [ERROR_CODES.UNAUTHORIZED]: "You need to be signed in to perform this action",
  [ERROR_CODES.FORBIDDEN]: "You don't have permission to perform this action",
  [ERROR_CODES.VALIDATION_ERROR]: "Please check your input and try again",
  [ERROR_CODES.INVALID_INPUT]: "The information provided is not valid",
  [ERROR_CODES.API_ERROR]: "Something went wrong. Please try again",
  [ERROR_CODES.NETWORK_ERROR]: "Network connection failed. Please check your internet connection",
  [ERROR_CODES.TIMEOUT_ERROR]: "Request timed out. Please try again",
  [ERROR_CODES.SESSION_CREATE_FAILED]: "Failed to start chat session. Please try again",
  [ERROR_CODES.MESSAGE_SEND_FAILED]: "Failed to send message. Please try again",
  [ERROR_CODES.STREAMING_ERROR]: "Connection lost while receiving response",
  [ERROR_CODES.DATABASE_ERROR]: "Database operation failed. Please try again",
  [ERROR_CODES.RECORD_NOT_FOUND]: "The requested information was not found",
  [ERROR_CODES.INTERNAL_ERROR]: "An internal error occurred. Please try again",
  [ERROR_CODES.UNKNOWN_ERROR]: "An unexpected error occurred. Please try again"
} as const;

// Error classification
interface AppError {
  code: string;
  message: string;
  userMessage: string;
  originalError?: unknown;
}

/**
 * Transform any error into a consistent AppError format
 */
export function handleError(error: unknown): AppError {
  // If it's already an AppError or ChatError, return as is
  if (isAppError(error)) {
    return {
      code: error.code,
      message: error.message,
      userMessage: ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES] || error.message,
      originalError: error
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    const code = classifyError(error);
    return {
      code,
      message: error.message,
      userMessage: ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] || error.message,
      originalError: error
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: error,
      userMessage: error,
      originalError: error
    };
  }

  // Handle unknown errors
  return {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: "An unexpected error occurred",
    userMessage: ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
    originalError: error
  };
}

/**
 * Check if an error is already an AppError or ChatError
 */
function isAppError(error: unknown): error is ChatError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as ChatError).code === 'string' &&
    typeof (error as ChatError).message === 'string'
  );
}

/**
 * Classify error type based on the error message and properties
 */
function classifyError(error: Error): string {
  const message = error.message.toLowerCase();

  // Network errors
  if (message.includes('fetch') || message.includes('network') || message.includes('connection')) {
    return ERROR_CODES.NETWORK_ERROR;
  }

  // Timeout errors
  if (message.includes('timeout') || message.includes('timed out')) {
    return ERROR_CODES.TIMEOUT_ERROR;
  }

  // Authentication errors
  if (message.includes('unauthorized') || message.includes('401')) {
    return ERROR_CODES.UNAUTHORIZED;
  }

  // Permission errors
  if (message.includes('forbidden') || message.includes('403')) {
    return ERROR_CODES.FORBIDDEN;
  }

  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || message.includes('400')) {
    return ERROR_CODES.VALIDATION_ERROR;
  }

  // Not found errors
  if (message.includes('not found') || message.includes('404')) {
    return ERROR_CODES.RECORD_NOT_FOUND;
  }

  // Database errors
  if (message.includes('database') || message.includes('sql') || message.includes('postgres')) {
    return ERROR_CODES.DATABASE_ERROR;
  }

  // Chat specific errors
  if (message.includes('conversation') || message.includes('message') || message.includes('chat')) {
    if (message.includes('send') || message.includes('create')) {
      return ERROR_CODES.MESSAGE_SEND_FAILED;
    }
    if (message.includes('session')) {
      return ERROR_CODES.SESSION_CREATE_FAILED;
    }
  }

  // Server errors
  if (message.includes('500') || message.includes('internal')) {
    return ERROR_CODES.INTERNAL_ERROR;
  }

  // Default to API error
  return ERROR_CODES.API_ERROR;
}

/**
 * Create a standardized error for API responses
 */
export function createApiError(code: string, message: string, details?: Record<string, unknown>): ChatError {
  return {
    code,
    message,
    details
  };
}

/**
 * Log error with context for debugging
 */
export function logError(error: unknown, context?: string): void {
  const appError = handleError(error);
  
  console.error(`[ERROR${context ? ` - ${context}` : ''}]:`, {
    code: appError.code,
    message: appError.message,
    userMessage: appError.userMessage,
    originalError: appError.originalError,
    timestamp: new Date().toISOString()
  });
} 