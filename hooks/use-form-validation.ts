import { useState, useCallback } from 'react';
import { ValidationRule, validateField } from '@/lib/validation/form-validation';

export interface FormField<T = unknown> {
  value: T;
  rules: ValidationRule;
}

export interface FormConfig {
  [fieldName: string]: FormField;
}

export const useFormValidation = <T extends Record<string, unknown>>(
  initialValues: T, 
  validationRules: Record<keyof T, ValidationRule>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateFieldValue = useCallback((name: keyof T, value: unknown): string | null => {
    const rules = validationRules[name];
    if (!rules) return null;
    
    return validateField(value, rules);
  }, [validationRules]);

  const setFieldValue = useCallback((name: keyof T, value: unknown) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Validate immediately if field was touched
    if (touched[name]) {
      const error = validateFieldValue(name, value);
      setErrors(prev => ({ ...prev, [name]: error || undefined }));
    }
  }, [touched, validateFieldValue]);

  const setFieldTouched = useCallback((name: keyof T, isTouched: boolean = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
    
    if (isTouched) {
      const error = validateFieldValue(name, values[name]);
      setErrors(prev => ({ ...prev, [name]: error || undefined }));
    }
  }, [values, validateFieldValue]);

  const validateAllFields = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const name = fieldName as keyof T;
      const error = validateFieldValue(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    return isValid;
  }, [values, validationRules, validateFieldValue]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const getFieldProps = useCallback((name: keyof T) => ({
    value: values[name],
    error: errors[name],
    touched: touched[name],
    onChange: (value: unknown) => setFieldValue(name, value),
    onBlur: () => setFieldTouched(name, true),
  }), [values, errors, touched, setFieldValue, setFieldTouched]);

  const clearFieldError = useCallback((name: keyof T) => {
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

  return {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    validateAllFields,
    reset,
    getFieldProps,
    clearFieldError,
    isValid: Object.values(errors).filter(Boolean).length === 0,
    hasErrors: Object.values(errors).some(Boolean),
  };
}; 