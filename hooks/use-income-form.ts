import { useState, useEffect, useCallback } from "react";
import { useIncomeCreateSWR, useIncomeUpdateSWR } from "@/hooks/swr";
import { useToast } from "@/hooks/use-toast";
import { useAppTranslation } from "@/hooks/use-translation";
import {
  Income,
  CreateIncomeRequest,
  UpdateIncomeRequest,
  INCOME_CATEGORIES,
} from "@/lib/types/income.types";
import {
  validateIncomeName,
  validateIncomeAmount,
  validateIncomeDescription,
} from "@/lib/validation/financial-validators";

interface IncomeFormData {
  name: string;
  amount: number;
  category: string;
  description: string | null;
  recurring: number;
}

interface IncomeFormValidationErrors {
  name?: string;
  amount?: string;
  description?: string;
}

interface IncomeFormTouched {
  name: boolean;
  amount: boolean;
  description: boolean;
}

interface UseIncomeFormProps {
  mode: "create" | "edit";
  isOpen: boolean;
  income?: Income | null;
  onSuccess: () => void;
  onClose: () => void;
  onIncomeCreated?: (income: Income) => Promise<void>;
  onIncomeUpdated?: (income: Income) => Promise<void>;
}

interface UseIncomeFormReturn {
  formData: IncomeFormData;
  validationErrors: IncomeFormValidationErrors;
  touched: IncomeFormTouched;
  isLoading: boolean;
  error: string | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleInputChange: (
    field: keyof IncomeFormData,
    value: string | number
  ) => void;
  handleFieldBlur: (field: keyof IncomeFormTouched) => void;
  handleClose: () => void;
  parseFormattedNumber: (value: string) => number;
}

export const useIncomeForm = ({
  mode,
  isOpen,
  income,
  onSuccess,
  onClose,
  onIncomeCreated,
  onIncomeUpdated,
}: UseIncomeFormProps): UseIncomeFormReturn => {
  const { t } = useAppTranslation(["income", "common"]);
  const toast = useToast();

  // SWR hooks
  const { createIncome, isCreating, error: createError } = useIncomeCreateSWR();
  const { updateIncome, isUpdating, error: updateError } = useIncomeUpdateSWR();

  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;

  // Initial form data
  const getInitialFormData = (): IncomeFormData => {
    if (mode === "edit" && income) {
      // Extract category from description for edit mode
      const getCategoryFromDescription = (
        description: string | null
      ): string => {
        if (!description) return INCOME_CATEGORIES.OTHER;

        const desc = description.toLowerCase();
        for (const [, value] of Object.entries(INCOME_CATEGORIES)) {
          if (desc.includes(value.toLowerCase())) {
            return value;
          }
        }
        return INCOME_CATEGORIES.OTHER;
      };

      return {
        name: income.name,
        amount: income.amount,
        category: getCategoryFromDescription(income.description),
        description: income.description,
        recurring: income.recurring,
      };
    }

    return {
      name: "",
      amount: 0,
      category: INCOME_CATEGORIES.SALARY,
      description: "",
      recurring: 0,
    };
  };

  // Form state
  const [formData, setFormData] = useState<IncomeFormData>(getInitialFormData);
  const [validationErrors, setValidationErrors] =
    useState<IncomeFormValidationErrors>({});
  const [touched, setTouched] = useState<IncomeFormTouched>({
    name: false,
    amount: false,
    description: false,
  });

  // Reset form when modal opens/closes or income changes
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setValidationErrors({});
      setTouched({
        name: false,
        amount: false,
        description: false,
      });
    }
  }, [isOpen, income, mode]);

  // Helper function to parse formatted number
  const parseFormattedNumber = (value: string): number => {
    // Remove commas and convert to number
    const cleanValue = value.replace(/,/g, "");
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Validation
  const validateForm = (): boolean => {
    const errors: IncomeFormValidationErrors = {};

    // Validate name
    const nameError = validateIncomeName(formData.name);
    if (nameError) errors.name = nameError;

    // Validate amount
    const amountError = validateIncomeAmount(formData.amount);
    if (amountError) errors.amount = amountError;

    // Validate description
    if (formData.description) {
      const descError = validateIncomeDescription(formData.description);
      if (descError) errors.description = descError;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input change
  const handleInputChange = useCallback(
    (field: keyof IncomeFormData, value: string | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear validation error for this field
      if (validationErrors[field as keyof IncomeFormValidationErrors]) {
        setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [validationErrors]
  );

  // Handle field blur
  const handleFieldBlur = useCallback((field: keyof IncomeFormTouched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      name: true,
      amount: true,
      description: true,
    });

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      if (mode === "create") {
        // Build description with category included
        const description = formData.description
          ? `${formData.category}: ${formData.description}`
          : formData.category;

        const createData: CreateIncomeRequest = {
          name: formData.name,
          amount: formData.amount,
          description,
          recurring: formData.recurring,
        };

        const newIncome = await createIncome(createData);
        if (newIncome) {
          toast.success(t("incomeCreateSuccess", { ns: "income" }));
          await onIncomeCreated?.(newIncome);
          onSuccess();
        }
      } else if (mode === "edit" && income) {
        // Build description with category included
        const description = formData.description
          ? `${formData.category}: ${formData.description}`
          : formData.category;

        const updateData: UpdateIncomeRequest = {
          name: formData.name,
          amount: formData.amount,
          description,
          recurring: formData.recurring,
        };

        const updatedIncome = await updateIncome(income.id, updateData);
        if (updatedIncome) {
          toast.success(t("incomeUpdateSuccess", { ns: "income" }));
          await onIncomeUpdated?.(updatedIncome);
          onSuccess();
        }
      }
    } catch {
      const errorMsg =
        mode === "create"
          ? t("incomeCreateError", { ns: "income" })
          : t("incomeUpdateError", { ns: "income" });
      toast.error(errorMsg);
    }
  };

  // Handle close
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return {
    formData,
    validationErrors,
    touched,
    isLoading,
    error,
    handleSubmit,
    handleInputChange,
    handleFieldBlur,
    handleClose,
    parseFormattedNumber,
  };
};
