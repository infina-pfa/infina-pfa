import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCreateBudget, useUpdateBudget } from "@/hooks/swr/budget";
import {
  CreateBudgetRequest,
  UpdateBudgetRequest,
  Budget,
  BudgetCategory,
} from "@/lib/types/budget.types";
import {
  inputValidationRules,
  parseFormattedNumber,
} from "@/lib/validation/input-validation";
import { validateField } from "@/lib/validation/form-validation";
import { BUDGET_COLORS } from "@/lib/utils/budget-constants";
import { useToast } from "@/hooks/use-toast";

type BudgetModalMode = "create" | "edit";

interface BudgetFormData {
  name: string;
  month: number;
  year: number;
  color: string;
  icon: string;
  category: string;
  amount: number;
}

interface UseBudgetFormProps {
  mode: BudgetModalMode;
  isOpen: boolean;
  budget?: Budget | null;
  onSuccess: () => void;
  onClose: () => void;
  onBudgetCreated?: (budget: Budget) => Promise<void>;
  onBudgetUpdated?: (budget: Budget, oldAmount?: number) => Promise<void>;
}

export const useBudgetForm = ({
  mode,
  isOpen,
  budget,
  onSuccess,
  onClose,
  onBudgetCreated,
  onBudgetUpdated,
}: UseBudgetFormProps) => {
  const { t } = useTranslation();
  const toast = useToast();

  // Get current month and year for the hooks
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // ✨ Use new SWR hooks
  const {
    createBudget,
    isCreating,
    error: createError,
  } = useCreateBudget(currentMonth, currentYear);

  const {
    updateBudget,
    isUpdating,
    error: updateError,
  } = useUpdateBudget(budget?.id || "", currentMonth, currentYear);

  // Determine which hooks to use based on mode
  const isLoading = mode === "create" ? isCreating : isUpdating;
  const error = mode === "create" ? createError : updateError;

  // Default form data
  const getDefaultFormData = (): BudgetFormData => ({
    name: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    color: BUDGET_COLORS[0],
    icon: "wallet",
    category: "flexible",
    amount: 0,
  });

  // Form state
  const [formData, setFormData] = useState<BudgetFormData>(
    getDefaultFormData()
  );

  // Form validation errors
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // Form touched state
  const [touched, setTouched] = useState<{
    [key: string]: boolean;
  }>({});

  // Pre-fill form data for edit mode
  useEffect(() => {
    if (mode === "edit" && budget && isOpen) {
      setFormData({
        name: budget.name,
        month: budget.month,
        year: budget.year,
        color: budget.color || BUDGET_COLORS[0],
        icon: budget.icon || "wallet",
        category: budget.category || "flexible",
        amount: budget.amount,
      });
      setValidationErrors({});
      setTouched({});
    } else if (mode === "create" && isOpen) {
      // Reset to defaults for create mode
      setFormData(getDefaultFormData());
      setValidationErrors({});
      setTouched({});
    }
  }, [mode, budget, isOpen]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // Validate name using the name validation rule
    const nameError = validateField(formData.name, inputValidationRules.name);
    if (nameError) {
      errors.name = nameError;
    }

    // Validate amount using the money validation rule
    const amountError = validateField(
      formData.amount,
      inputValidationRules.money
    );
    if (amountError) {
      errors.amount = amountError;
    }

    if (formData.month < 1 || formData.month > 12) {
      errors.month = t("validMonthRequired", { ns: "budgeting" });
    }

    if (formData.year < 2020) {
      errors.year = t("validYearRequired", { ns: "budgeting" });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as { [key: string]: boolean });
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    try {
      if (mode === "create") {
        const createData: CreateBudgetRequest = {
          name: formData.name,
          amount: formData.amount,
          category:
            formData.category === "fixed"
              ? BudgetCategory.FIXED
              : BudgetCategory.FLEXIBLE,
          color: formData.color,
          icon: formData.icon,
          month: formData.month,
          year: formData.year,
        };

        const result = await createBudget(createData);
        if (result) {
          // Call the callback if provided
          if (onBudgetCreated) {
            await onBudgetCreated(result);
          }
          toast.success(t("budgetCreated", { ns: "budgeting" }));
          onSuccess();
          onClose();

          // Reset form for create mode
          setFormData(getDefaultFormData());
          setValidationErrors({});
          setTouched({});
        }
      } else if (mode === "edit" && budget) {
        const updateData: UpdateBudgetRequest = {
          name: formData.name,
          amount: formData.amount,
          category:
            formData.category === "fixed"
              ? BudgetCategory.FIXED
              : BudgetCategory.FLEXIBLE,
          color: formData.color,
          icon: formData.icon,
        };

        const oldAmount = budget.amount;
        const result = await updateBudget(updateData);

        if (result) {
          // Call the callback if provided
          if (onBudgetUpdated) {
            await onBudgetUpdated(result, oldAmount);
          }
          toast.success(t("budgetUpdated", { ns: "budgeting" }));
          onSuccess();
          onClose();
        }
      }
    } catch (err) {
      // Show error toast using error code as translation key
      const error = err as { code?: string; message?: string };
      if (error?.code) {
        toast.error(t(error.code, { 
          ns: "errors", 
          defaultValue: error.message || t("UNKNOWN_ERROR", { ns: "errors" })
        }));
      } else {
        toast.error(t("UNKNOWN_ERROR", { ns: "errors" }));
      }
    }
  };

  const handleInputChange = (
    field: keyof BudgetFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate the field on blur
    if (field === "name") {
      const nameError = validateField(formData.name, inputValidationRules.name);
      if (nameError) {
        setValidationErrors((prev) => ({ ...prev, name: nameError }));
      }
    } else if (field === "amount") {
      const amountError = validateField(
        formData.amount,
        inputValidationRules.money
      );
      if (amountError) {
        setValidationErrors((prev) => ({ ...prev, amount: amountError }));
      }
    }
  };

  const handleClose = () => {
    onClose();
    // Reset validation state
    setValidationErrors({});
    setTouched({});

    // Reset form state only for create mode
    if (mode === "create") {
      setFormData(getDefaultFormData());
    }
  };

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
