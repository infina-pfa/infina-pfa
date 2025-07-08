/**
 * Input validation rules for Infina PFA
 * Following single responsibility principle - each validator has one clear purpose
 */

import { ValidationRule } from './form-validation';

/**
 * Format a number as VND currency
 */
export const formatVND = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format a number with commas as thousand separators
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Parse a formatted number string back to a number
 */
export const parseFormattedNumber = (value: string): number => {
  // Remove all non-digit characters
  const cleanValue = value.replace(/[^\d]/g, '');
  return cleanValue ? parseInt(cleanValue, 10) : 0;
};

/**
 * Standard validation rules for different input types
 */
export const inputValidationRules = {
  /**
   * For name, title inputs: min 3 char, max 40 char
   */
  name: {
    required: true,
    minLength: 3,
    maxLength: 40,
    custom: (value: unknown) => {
      if (typeof value !== 'string') return 'Must be text';
      if (value.trim().length < 3) return 'Must be at least 3 characters';
      if (value.trim().length > 40) return 'Must be no more than 40 characters';
      return null;
    }
  } as ValidationRule,

  /**
   * For descriptions in forms: max 100 char
   */
  description: {
    required: false,
    maxLength: 100,
    custom: (value: unknown) => {
      if (!value) return null;
      if (typeof value !== 'string') return 'Must be text';
      if (value.trim().length > 100) return 'Must be no more than 100 characters';
      return null;
    }
  } as ValidationRule,

  /**
   * For chat with AI input: max 500 char
   */
  chatMessage: {
    required: true,
    maxLength: 500,
    custom: (value: unknown) => {
      if (!value) return 'Message is required';
      if (typeof value !== 'string') return 'Must be text';
      if (value.trim().length === 0) return 'Message cannot be empty';
      if (value.trim().length > 500) return 'Message must be no more than 500 characters';
      return null;
    }
  } as ValidationRule,

  /**
   * For money input: max value 999,999,999,999,999 VND
   */
  money: {
    required: true,
    min: 0,
    max: 999999999999999,
    custom: (value: unknown) => {
      if (value === null || value === undefined || value === '') return 'Amount is required';
      
      let numValue: number;
      if (typeof value === 'string') {
        // Parse string removing currency symbols and separators
        numValue = parseFormattedNumber(value);
      } else if (typeof value === 'number') {
        numValue = value;
      } else {
        return 'Invalid amount format';
      }
      
      if (isNaN(numValue)) return 'Must be a valid number';
      if (numValue < 0) return 'Amount must be positive or zero';
      if (numValue > 999999999999999) return 'Amount is too large';
      
      return null;
    }
  } as ValidationRule,

  /**
   * For general number input: max value 999,999,999,999
   */
  number: {
    required: true,
    min: 0,
    max: 999999999999,
    custom: (value: unknown) => {
      if (value === null || value === undefined || value === '') return 'Number is required';
      
      let numValue: number;
      if (typeof value === 'string') {
        // Parse string removing separators
        numValue = parseFormattedNumber(value);
      } else if (typeof value === 'number') {
        numValue = value;
      } else {
        return 'Invalid number format';
      }
      
      if (isNaN(numValue)) return 'Must be a valid number';
      if (numValue < 0) return 'Number must be positive or zero';
      if (numValue > 999999999999) return 'Number is too large';
      
      return null;
    }
  } as ValidationRule,
}; 