"use client";

import { useState, useEffect, useCallback } from "react";
import { useCreateDebt, useUpdateDebt } from "@/hooks/swr/debt";
import { CreateDebtRequest, UpdateDebtRequest, DebtResponse } from "@/lib/types/debt.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";
import { z } from "zod";
import { 
  debtFormSchema, 
  createDebtSchema, 
  updateDebtSchema,
  type DebtFormData 
} from "@/lib/validation/schemas/debt.schema";

type DebtFormMode = "create" | "edit";

interface UseDebtFormProps {
  mode: DebtFormMode;
  isOpen: boolean;
  debt?: DebtResponse | null;
  onSuccess: () => void;
  onClose: () => void;
  onDebtCreated?: (debt: DebtResponse) => Promise<void>;
  onDebtUpdated?: (debt: DebtResponse) => Promise<void>;
}

interface ValidationErrors {
  lender?: string;
  purpose?: string;
  amount?: string;
  rate?: string;
  dueDate?: string;
}

interface TouchedFields {
  lender?: boolean;
  purpose?: boolean;
  amount?: boolean;
  rate?: boolean;
  dueDate?: boolean;
  currentPaidAmount?: boolean;
}

export function useDebtForm({
  mode,
  isOpen,
  debt,
  onSuccess,
  onClose,
  onDebtCreated,
  onDebtUpdated,
}: UseDebtFormProps) {
  const { t } = useAppTranslation(["debt", "common"]);
  const { createDebt, isCreating } = useCreateDebt();
  const { updateDebt, isUpdating } = useUpdateDebt(debt?.id || "");

  // Form state
  const [formData, setFormData] = useState<DebtFormData>({
    lender: "",
    purpose: "",
    amount: 0,
    rate: 0,
    dueDate: "",
    currentPaidAmount: 0,
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const isLoading = mode === "create" ? isCreating : isUpdating;

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && debt) {
        setFormData({
          lender: debt.lender,
          purpose: debt.purpose,
          amount: debt.amount,
          rate: debt.rate,
          dueDate: debt.dueDate.split("T")[0], // Convert to YYYY-MM-DD format
          currentPaidAmount: debt.currentPaidAmount || 0,
        });
      } else {
        // Reset for create mode
        setFormData({
          lender: "",
          purpose: "",
          amount: 0,
          rate: 0,
          dueDate: "",
          currentPaidAmount: 0,
        });
      }
      setValidationErrors({});
      setTouched({});
    }
  }, [isOpen, mode, debt]);

  // Validation using Zod
  const validateField = useCallback(
    (field: keyof DebtFormData, value: unknown): string | undefined => {
      try {
        // Create a partial schema for single field validation based on field
        let fieldSchema;
        switch (field) {
          case "lender":
            fieldSchema = debtFormSchema.pick({ lender: true });
            break;
          case "purpose":
            fieldSchema = debtFormSchema.pick({ purpose: true });
            break;
          case "amount":
            fieldSchema = debtFormSchema.pick({ amount: true });
            break;
          case "rate":
            fieldSchema = debtFormSchema.pick({ rate: true });
            break;
          case "dueDate":
            fieldSchema = debtFormSchema.pick({ dueDate: true });
            break;
          case "currentPaidAmount":
            fieldSchema = debtFormSchema.pick({ currentPaidAmount: true });
            break;
          default:
            return undefined;
        }
        
        // Special handling for date field
        if (field === "dueDate" && value) {
          const dateSchema = z.string().min(1, 'dueDateRequired').refine((dateStr) => {
            const selectedDate = new Date(dateStr);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return selectedDate >= today;
          }, 'dueDatePast');
          
          dateSchema.parse(value);
        } else {
          fieldSchema.parse({ [field]: value });
        }
        
        return undefined;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.errors[0];
          return t(fieldError.message, { ns: "debt" });
        }
        return undefined;
      }
    },
    [t]
  );


  // Handlers
  const handleInputChange = useCallback(
    (field: keyof DebtFormData, value: string | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      
      // Clear error when user starts typing
      if (touched[field]) {
        const error = validateField(field, value);
        setValidationErrors((prev) => ({ ...prev, [field]: error }));
      }
    },
    [touched, validateField]
  );

  const handleFieldBlur = useCallback(
    (field: keyof DebtFormData) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(field, formData[field]);
      setValidationErrors((prev) => ({ ...prev, [field]: error }));
    },
    [formData, validateField]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Mark all fields as touched
      setTouched({
        lender: true,
        purpose: true,
        amount: true,
        rate: true,
        dueDate: true,
      });

      try {
        // Prepare data for validation
        const dataToValidate = {
          lender: formData.lender.trim(),
          purpose: formData.purpose.trim(),
          amount: formData.amount,
          rate: formData.rate,
          dueDate: formData.dueDate ? new Date(formData.dueDate) : new Date(),
          currentPaidAmount: formData.currentPaidAmount,
        };

        if (mode === "create") {
          // Validate with create schema
          const validatedData = createDebtSchema.parse(dataToValidate);
          
          const createData: CreateDebtRequest = {
            ...validatedData,
            dueDate: validatedData.dueDate,
          };

          const newDebt = await createDebt(createData);
          if (newDebt) {
            toast.success(t("debtCreatedSuccess"));
            if (onDebtCreated) {
              await onDebtCreated(newDebt);
            }
            onSuccess();
            onClose();
          }
        } else if (mode === "edit" && debt) {
          // Validate with update schema
          const validatedData = updateDebtSchema.parse({
            lender: dataToValidate.lender,
            purpose: dataToValidate.purpose,
            rate: dataToValidate.rate,
            dueDate: dataToValidate.dueDate,
          });

          const updateData: UpdateDebtRequest = validatedData;

          await updateDebt(updateData);
          toast.success(t("debtUpdatedSuccess"));
          if (onDebtUpdated && debt) {
            await onDebtUpdated({ ...debt, ...updateData } as DebtResponse);
          }
          onSuccess();
          onClose();
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Handle validation errors
          const errors: ValidationErrors = {};
          error.errors.forEach((err) => {
            const field = err.path[0] as keyof ValidationErrors;
            if (field && !errors[field]) {
              errors[field] = t(err.message, { ns: "debt" });
            }
          });
          setValidationErrors(errors);
        } else {
          // Handle API errors
          console.error("Error submitting debt form:", error);
          toast.error(
            mode === "create" 
              ? t("debtCreateError", { ns: "debt" })
              : t("debtUpdateError", { ns: "debt" })
          );
        }
      }
    },
    [
      mode,
      formData,
      debt,
      createDebt,
      updateDebt,
      t,
      onSuccess,
      onClose,
      onDebtCreated,
      onDebtUpdated,
    ]
  );

  const handleClose = useCallback(() => {
    if (!isLoading) {
      onClose();
    }
  }, [isLoading, onClose]);

  const parseFormattedNumber = useCallback((value: string | number): number => {
    if (typeof value === "number") return value;
    const cleanedValue = value.replace(/[^0-9.-]/g, "");
    return parseFloat(cleanedValue) || 0;
  }, []);

  return {
    formData,
    validationErrors,
    touched,
    isLoading,
    handleSubmit,
    handleInputChange,
    handleFieldBlur,
    handleClose,
    parseFormattedNumber,
  };
}