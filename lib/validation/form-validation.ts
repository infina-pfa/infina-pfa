export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => string | null;
}

export interface FieldValidation {
  value: unknown;
  error: string | null;
  touched: boolean;
}

export const validateField = (value: unknown, rules: ValidationRule): string | null => {
  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return 'This field is required';
  }

  // Skip other validations if field is empty and not required
  if (!value && !rules.required) {
    return null;
  }

  // String validations
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return `Must be at least ${rules.minLength} characters`;
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      return `Must be no more than ${rules.maxLength} characters`;
    }
    
    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Invalid format';
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      return `Must be at least ${rules.min}`;
    }
    
    if (rules.max !== undefined && value > rules.max) {
      return `Must be no more than ${rules.max}`;
    }
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

// Budget-specific validation rules
export const budgetValidationRules = {
  name: {
    required: true,
    minLength: 1,
    maxLength: 255,
  } as ValidationRule,
  
  amount: {
    required: true,
    min: 0.01,
    max: 999999999.99,
    custom: (value: string) => {
      if (!value) return null;
      const num = parseFloat(value);
      if (isNaN(num)) return 'Must be a valid number';
      if (num <= 0) return 'Amount must be greater than 0';
      return null;
    }
  } as ValidationRule,
  
  category: {
    required: false,
  } as ValidationRule,
  
  color: {
    required: true,
    pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    custom: (value: string) => {
      if (!value) return null;
      if (!value.startsWith('#')) return 'Color must start with #';
      return null;
    }
  } as ValidationRule,
  
  icon: {
    required: true,
    minLength: 1,
  } as ValidationRule,
  
  endDate: {
    required: true,
    custom: (value: string) => {
      if (!value) return null;
      const endDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isNaN(endDate.getTime())) {
        return 'Invalid date format';
      }
      
      if (endDate <= today) {
        return 'End date must be in the future';
      }
      return null;
    }
  } as ValidationRule,
  
  startDate: {
    required: false,
    custom: (value: string) => {
      if (!value) return null;
      const startDate = new Date(value);
      if (isNaN(startDate.getTime())) {
        return 'Invalid date format';
      }
      return null;
    }
  } as ValidationRule,
};

// Cross-field validation for date range
export const validateDateRange = (startDate: string, endDate: string): string | null => {
  if (!startDate || !endDate) return null;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return null; // Let individual field validation handle invalid dates
  }
  
  if (end <= start) {
    return 'End date must be after start date';
  }
  
  return null;
}; 