import { AuthError } from '@supabase/supabase-js';
import { ErrorCode, ERROR_MESSAGES } from './errors';

export interface AppError {
  code: ErrorCode;
  message: string;
  originalError?: Error;
}

export const handleError = (error: unknown): AppError => {
  // Handle Supabase Auth Errors
  if (error instanceof AuthError) {
    const message = error.message.toLowerCase();
    
    if (message.includes('invalid login credentials')) {
      return { 
        code: ErrorCode.INVALID_CREDENTIALS, 
        message: ERROR_MESSAGES[ErrorCode.INVALID_CREDENTIALS],
        originalError: error
      };
    }
    
    if (message.includes('email not confirmed')) {
      return { 
        code: ErrorCode.EMAIL_NOT_CONFIRMED, 
        message: ERROR_MESSAGES[ErrorCode.EMAIL_NOT_CONFIRMED],
        originalError: error
      };
    }
    
    if (message.includes('jwt expired') || message.includes('token expired')) {
      return { 
        code: ErrorCode.TOKEN_EXPIRED, 
        message: ERROR_MESSAGES[ErrorCode.TOKEN_EXPIRED],
        originalError: error
      };
    }
    
    return { 
      code: ErrorCode.UNAUTHORIZED, 
      message: ERROR_MESSAGES[ErrorCode.UNAUTHORIZED],
      originalError: error
    };
  }

  // Handle Network Errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return { 
      code: ErrorCode.NETWORK_ERROR, 
      message: ERROR_MESSAGES[ErrorCode.NETWORK_ERROR],
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
        message: ERROR_MESSAGES[ErrorCode.VALIDATION_ERROR],
        originalError: error
      };
    }
    
    // Check for not found errors
    if (message.includes('expense not found')) {
      return { 
        code: ErrorCode.EXPENSE_NOT_FOUND, 
        message: ERROR_MESSAGES[ErrorCode.EXPENSE_NOT_FOUND],
        originalError: error
      };
    }
    
    if (message.includes('budget not found') || message.includes('not found')) {
      return { 
        code: ErrorCode.BUDGET_NOT_FOUND, 
        message: ERROR_MESSAGES[ErrorCode.BUDGET_NOT_FOUND],
        originalError: error
      };
    }
    
    // Check for duplicate errors
    if (message.includes('duplicate') || message.includes('already exists')) {
      return { 
        code: ErrorCode.DUPLICATE_BUDGET_NAME, 
        message: ERROR_MESSAGES[ErrorCode.DUPLICATE_BUDGET_NAME],
        originalError: error
      };
    }
    
    // Check for expense-specific errors
    if (message.includes('expense amount must be greater than 0') || message.includes('amount must be greater than 0')) {
      return { 
        code: ErrorCode.INVALID_EXPENSE_AMOUNT, 
        message: ERROR_MESSAGES[ErrorCode.INVALID_EXPENSE_AMOUNT],
        originalError: error
      };
    }
    
    if (message.includes('expense date cannot be in the future') || message.includes('future')) {
      return { 
        code: ErrorCode.FUTURE_EXPENSE_DATE, 
        message: ERROR_MESSAGES[ErrorCode.FUTURE_EXPENSE_DATE],
        originalError: error
      };
    }
    
    if (message.includes('recurring month must be between')) {
      return { 
        code: ErrorCode.INVALID_RECURRING_MONTH, 
        message: ERROR_MESSAGES[ErrorCode.INVALID_RECURRING_MONTH],
        originalError: error
      };
    }
    
    if (message.includes('description cannot exceed 500 characters')) {
      return { 
        code: ErrorCode.EXPENSE_DESCRIPTION_TOO_LONG, 
        message: ERROR_MESSAGES[ErrorCode.EXPENSE_DESCRIPTION_TOO_LONG],
        originalError: error
      };
    }
    
    // Check for date validation errors
    if (message.includes('date') && (message.includes('invalid') || message.includes('before') || message.includes('after'))) {
      return { 
        code: ErrorCode.INVALID_DATE_RANGE, 
        message: ERROR_MESSAGES[ErrorCode.INVALID_DATE_RANGE],
        originalError: error
      };
    }
    
    // Check for server errors
    if (message.includes('500') || message.includes('internal server error')) {
      return { 
        code: ErrorCode.SERVER_ERROR, 
        message: ERROR_MESSAGES[ErrorCode.SERVER_ERROR],
        originalError: error
      };
    }
    
    // Check for unauthorized
    if (message.includes('401') || message.includes('unauthorized')) {
      return { 
        code: ErrorCode.UNAUTHORIZED, 
        message: ERROR_MESSAGES[ErrorCode.UNAUTHORIZED],
        originalError: error
      };
    }
    
    // Default to server error for other Error instances
    return { 
      code: ErrorCode.SERVER_ERROR, 
      message: ERROR_MESSAGES[ErrorCode.SERVER_ERROR],
      originalError: error 
    };
  }

  // Handle unknown errors
  return { 
    code: ErrorCode.UNKNOWN_ERROR, 
    message: ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR] 
  };
}; 