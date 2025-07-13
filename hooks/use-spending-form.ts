import { useState, useCallback, useMemo } from "react";
import { useAppTranslation } from "@/hooks/use-translation";
import {
  SpendingFormData,
  SpendingFormValidationErrors,
  SpendingFormTouched,
  SpendingData,
  UseSpendingFormProps,
  UseSpendingFormReturn,
  SPENDING_VALIDATION_RULES,
  SPENDING_CATEGORIES,
} from "@/lib/types/spending.types";
import { parseFormattedNumber } from "@/lib/validation/input-validation";

export const useSpendingForm = ({
  onUserSubmit,
  initialData,
}: UseSpendingFormProps): UseSpendingFormReturn => {
  const { t } = useAppTranslation(["spending", "common"]);

  // Initial form data
  const getInitialFormData = (): SpendingFormData => ({
    housing: initialData?.housing || 0,
    food: initialData?.food || 0,
    transportation: initialData?.transportation || 0,
    other: initialData?.other || 0,
  });

  // Form state
  const [formData, setFormData] = useState<SpendingFormData>(
    getInitialFormData()
  );
  const [validationErrors, setValidationErrors] =
    useState<SpendingFormValidationErrors>({});
  const [touched, setTouched] = useState<SpendingFormTouched>({
    housing: false,
    food: false,
    transportation: false,
    other: false,
  });

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return (
      formData.housing +
      formData.food +
      formData.transportation +
      formData.other
    );
  }, [
    formData.housing,
    formData.food,
    formData.transportation,
    formData.other,
  ]);

  // Validate individual field
  const validateField = useCallback(
    (field: keyof SpendingFormData, value: number): string | null => {
      // Required field validation
      if (value === null || value === undefined || isNaN(value)) {
        switch (field) {
          case SPENDING_CATEGORIES.HOUSING:
            return t("housingRequired");
          case SPENDING_CATEGORIES.FOOD:
            return t("foodRequired");
          case SPENDING_CATEGORIES.TRANSPORTATION:
            return t("transportationRequired");
          case SPENDING_CATEGORIES.OTHER:
            return t("otherRequired");
          default:
            return t("invalidAmount");
        }
      }

      // Value range validation
      if (value < SPENDING_VALIDATION_RULES.MIN_AMOUNT) {
        return t("amountMustBePositive");
      }

      if (value > SPENDING_VALIDATION_RULES.MAX_AMOUNT) {
        return t("amountTooLarge");
      }

      return null;
    },
    [t]
  );

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const errors: SpendingFormValidationErrors = {};

    // Validate each field
    Object.keys(formData).forEach((key) => {
      const field = key as keyof SpendingFormData;
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, validateField]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return Object.keys(formData).every((key) => {
      const field = key as keyof SpendingFormData;
      const value = formData[field];
      return value > 0 && !validateField(field, value);
    });
  }, [formData, validateField]);

  // Handle input change
  const handleInputChange = useCallback(
    (field: keyof SpendingFormData, value: string) => {
      // Parse the formatted number
      const numericValue = parseFormattedNumber(value);

      setFormData((prev) => ({ ...prev, [field]: numericValue }));

      // Clear validation error for this field if it exists
      if (validationErrors[field]) {
        setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
      }

      // Validate field if it's been touched
      if (touched[field]) {
        const error = validateField(field, numericValue);
        if (error) {
          setValidationErrors((prev) => ({ ...prev, [field]: error }));
        }
      }
    },
    [validationErrors, touched, validateField]
  );

  // Handle field blur
  const handleFieldBlur = useCallback(
    (field: keyof SpendingFormTouched) => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      // Validate field on blur
      const error = validateField(field, formData[field]);
      if (error) {
        setValidationErrors((prev) => ({ ...prev, [field]: error }));
      }
    },
    [formData, validateField]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Mark all fields as touched
      setTouched({
        housing: true,
        food: true,
        transportation: true,
        other: true,
      });

      // Validate form
      if (!validateForm()) {
        return;
      }

      // Prepare data for submission
      const spendingData: SpendingData = {
        housing: formData.housing,
        food: formData.food,
        transportation: formData.transportation,
        other: formData.other,
        total: totalAmount,
      };

      // Call the submission callback
      onUserSubmit(spendingData);
    },
    [formData, totalAmount, validateForm, onUserSubmit]
  );

  // Reset form
  const reset = useCallback(() => {
    setFormData(getInitialFormData());
    setValidationErrors({});
    setTouched({
      housing: false,
      food: false,
      transportation: false,
      other: false,
    });
  }, [initialData]);

  return {
    formData,
    validationErrors,
    touched,
    isFormValid,
    totalAmount,
    handleSubmit,
    handleInputChange,
    handleFieldBlur,
    reset,
  };
};
