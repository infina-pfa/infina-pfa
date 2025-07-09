import { useGoalCreateSWR, useGoalUpdateSWR } from "@/hooks/swr";
import { useToast } from "@/hooks/use-toast";
import { useAppTranslation } from "@/hooks/use-translation";
import {
  CreateGoalRequest,
  Goal,
  UpdateGoalRequest,
} from "@/lib/types/goal.types";
import {
  amountValidator,
  textValidator,
} from "@/lib/validation/financial-validators";
import { useCallback, useEffect, useState } from "react";

interface GoalFormData {
  title: string;
  description: string | null;
  current_amount: number;
  target_amount: number | null;
  due_date: string | null;
}

interface GoalFormValidationErrors {
  title?: string;
  description?: string;
  current_amount?: string;
  target_amount?: string;
  due_date?: string;
}

interface GoalFormTouched {
  title: boolean;
  description: boolean;
  current_amount: boolean;
  target_amount: boolean;
  due_date: boolean;
}

interface UseGoalFormProps {
  mode: "create" | "edit";
  isOpen: boolean;
  goal?: Goal | null;
  onSuccess: () => void;
  onClose: () => void;
  onGoalCreated?: (goal: Goal) => Promise<void>;
  onGoalUpdated?: (goal: Goal) => Promise<void>;
}

interface UseGoalFormReturn {
  formData: GoalFormData;
  validationErrors: GoalFormValidationErrors;
  touched: GoalFormTouched;
  isLoading: boolean;
  error: string | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleInputChange: (
    field: keyof GoalFormData,
    value: string | number | null
  ) => void;
  handleFieldBlur: (field: keyof GoalFormTouched) => void;
  handleClose: () => void;
  parseFormattedNumber: (value: string) => number;
}

export const useGoalForm = ({
  mode,
  isOpen,
  goal,
  onSuccess,
  onClose,
  onGoalCreated,
  onGoalUpdated,
}: UseGoalFormProps): UseGoalFormReturn => {
  const { t } = useAppTranslation(["goals", "common"]);
  const toast = useToast();

  // SWR hooks
  const { createGoal, isCreating, error: createError } = useGoalCreateSWR({});
  const { updateGoal, isUpdating, error: updateError } = useGoalUpdateSWR({});

  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;

  // Initial form data
  const getInitialFormData = (): GoalFormData => {
    if (mode === "edit" && goal) {
      return {
        title: goal.title,
        description: goal.description,
        current_amount: goal.current_amount,
        target_amount: goal.target_amount,
        due_date: goal.due_date,
      };
    }

    return {
      title: "",
      description: null,
      current_amount: 0,
      target_amount: null,
      due_date: null,
    };
  };

  // Form state
  const [formData, setFormData] = useState<GoalFormData>(getInitialFormData);
  const [validationErrors, setValidationErrors] =
    useState<GoalFormValidationErrors>({});
  const [touched, setTouched] = useState<GoalFormTouched>({
    title: false,
    description: false,
    current_amount: false,
    target_amount: false,
    due_date: false,
  });

  // Reset form when modal opens/closes or goal changes
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setValidationErrors({});
      setTouched({
        title: false,
        description: false,
        current_amount: false,
        target_amount: false,
        due_date: false,
      });
    }
  }, [isOpen, goal, mode]);

  // Helper function to parse formatted number
  const parseFormattedNumber = (value: string): number => {
    // Remove commas and convert to number
    const cleanValue = value.replace(/,/g, "");
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Validation
  const validateForm = (): boolean => {
    const errors: GoalFormValidationErrors = {};

    // Validate title
    if (!formData.title.trim()) {
      errors.title = t("goalTitleRequired");
    } else if (formData.title.length > 100) {
      errors.title = t("goalTitleTooLong");
    }

    // Validate current amount
    if (!amountValidator.isPositive(formData.current_amount)) {
      errors.current_amount = t("currentAmountPositive");
    }

    // Validate target amount if provided
    if (formData.target_amount !== null && formData.target_amount <= 0) {
      errors.target_amount = t("targetAmountPositive");
    }

    // Validate target amount is greater than current amount
    if (
      formData.target_amount !== null &&
      formData.current_amount > formData.target_amount
    ) {
      errors.target_amount = t("targetAmountGreaterThanCurrent");
    }

    // Validate description length if provided
    if (
      formData.description &&
      !textValidator.isWithinLimit(formData.description, 500)
    ) {
      errors.description = t("descriptionTooLong");
    }

    // Validate due date is in the future if provided
    if (formData.due_date) {
      const dueDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        errors.due_date = t("dueDateInFuture");
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input change
  const handleInputChange = useCallback(
    (field: keyof GoalFormData, value: string | number | null) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear validation error for this field
      if (validationErrors[field as keyof GoalFormValidationErrors]) {
        setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [validationErrors]
  );

  // Handle field blur
  const handleFieldBlur = useCallback((field: keyof GoalFormTouched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      title: true,
      description: true,
      current_amount: true,
      target_amount: true,
      due_date: true,
    });

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      if (mode === "create") {
        const createData: CreateGoalRequest = {
          title: formData.title,
          description: formData.description || undefined,
          current_amount: formData.current_amount,
          target_amount: formData.target_amount || undefined,
          due_date: formData.due_date || undefined,
        };

        const newGoal = await createGoal(createData);
        if (newGoal) {
          toast.success(t("goalCreateSuccess"));
          await onGoalCreated?.(newGoal);
          onSuccess();
        }
      } else if (mode === "edit" && goal) {
        const updateData: UpdateGoalRequest = {
          title: formData.title,
          description: formData.description || undefined,
          current_amount: formData.current_amount,
          target_amount: formData.target_amount || undefined,
          due_date: formData.due_date || undefined,
        };

        const updatedGoal = await updateGoal(goal.id, updateData);
        if (updatedGoal) {
          toast.success(t("goalUpdateSuccess"));
          await onGoalUpdated?.(updatedGoal);
          onSuccess();
        }
      }
    } catch {
      const errorMsg =
        mode === "create" ? t("goalCreateError") : t("goalUpdateError");
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
