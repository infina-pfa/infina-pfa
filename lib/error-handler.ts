import { AuthError } from '@supabase/supabase-js';
import { ErrorCode, ERROR_MESSAGES, ERROR_TRANSLATION_KEYS } from './errors';

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