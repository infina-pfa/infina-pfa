import { useCreateGoal, useUpdateGoal } from "@/hooks/swr/goal";
import { useToast } from "@/hooks/use-toast";
import { useAppTranslation } from "@/hooks/use-translation";
import {
  CreateGoalRequest,
  GoalResponseDto,
  UpdateGoalRequest,
} from "@/lib/types/goal.types";
import { textValidator } from "@/lib/validation/financial-validators";
import { useCallback, useEffect, useState } from "react";

interface GoalFormData {
  title: string;
  description: string | null;
  currentAmount: number;
  targetAmount: number | null;
  dueDate: string | null;
}

interface GoalFormValidationErrors {
  title?: string;
  description?: string;
  currentAmount?: string;
  targetAmount?: string;
  dueDate?: string;
}

interface GoalFormTouched {
  title: boolean;
  description: boolean;
  currentAmount: boolean;
  targetAmount: boolean;
  dueDate: boolean;
}

interface UseGoalFormProps {
  mode: "create" | "edit";
  isOpen: boolean;
  goal?: GoalResponseDto | null;
  onSuccess: () => void;
  onClose: () => void;
  onGoalCreated?: (goal: GoalResponseDto) => Promise<void>;
  onGoalUpdated?: (goal: GoalResponseDto) => Promise<void>;
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
  const { createGoal, isCreating, error: createError } = useCreateGoal();
  const { updateGoal, isUpdating, error: updateError } = useUpdateGoal(goal?.id || "");

  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;

  // Initial form data
  const getInitialFormData = (): GoalFormData => {
    if (mode === "edit" && goal) {
      return {
        title: goal.title,
        description: goal.description || null,
        currentAmount: goal.currentAmount || 0,
        targetAmount: goal.targetAmount || 0,
        dueDate: goal.dueDate || null,
      };
    }

    return {
      title: "",
      description: null,
      currentAmount: 0,
      targetAmount: null,
      dueDate: null,
    };
  };

  // Form state
  const [formData, setFormData] = useState<GoalFormData>(getInitialFormData);
  const [validationErrors, setValidationErrors] =
    useState<GoalFormValidationErrors>({});
  const [touched, setTouched] = useState<GoalFormTouched>({
    title: false,
    description: false,
    currentAmount: false,
    targetAmount: false,
    dueDate: false,
  });

  // Reset form when modal opens/closes or goal changes
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setValidationErrors({});
      setTouched({
        title: false,
        description: false,
        currentAmount: false,
        targetAmount: false,
        dueDate: false,
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

    // Validate target amount if provided
    if (formData.targetAmount !== null && formData.targetAmount <= 0) {
      errors.targetAmount = t("targetAmountPositive");
    }

    // Validate description length if provided
    if (
      formData.description &&
      !textValidator.isWithinLimit(formData.description, 500)
    ) {
      errors.description = t("descriptionTooLong");
    }

    // Validate due date is in the future if provided
    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        errors.dueDate = t("dueDateInFuture");
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
      currentAmount: true,
      targetAmount: true,
      dueDate: true,
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
          targetAmount: formData.targetAmount || undefined,
          dueDate: formData.dueDate || undefined,
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
          targetAmount: formData.targetAmount || undefined,
          dueDate: formData.dueDate || undefined,
        };

        const updatedGoal = await updateGoal(updateData);
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
