"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormInput } from "@/components/ui/form-input";
import { MoneyInput } from "@/components/ui/money-input";
import { useRecordSpending } from "@/hooks/swr/budget";
import { useAppTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { SpendRequest } from "@/lib/types/budget.types";
import { useState } from "react";

interface CreateExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  budget: {
    id: string;
    name: string;
    color: string;
  } | null;
  month: number;
  year: number;
  onExpenseCreated?: (
    name: string,
    amount: number,
    budgetName: string
  ) => Promise<void>;
}

export const CreateExpenseModal = ({
  isOpen,
  onClose,
  onSuccess,
  budget,
  month,
  year,
  onExpenseCreated,
}: CreateExpenseModalProps) => {
  const { t } = useAppTranslation(["budgeting", "common"]);
  const toast = useToast();

  const { recordSpending, isRecording } = useRecordSpending(
    budget?.id || "",
    month,
    year
  );

  const [formData, setFormData] = useState<SpendRequest>({
    amount: 0,
    name: "",
    description: "",
    recurring: 0, // One-time expense by default
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!budget) return;

    try {
      const result = await recordSpending(formData);

      if (result) {
        // Call the onExpenseCreated callback if provided
        if (onExpenseCreated) {
          await onExpenseCreated(
            formData.name || "Expense",
            formData.amount,
            budget.name
          );
        }

        // Show success message
        toast.success(t("expenseAdded", { ns: "budgeting" }));

        // Reset form
        setFormData({
          amount: 0,
          name: "",
          description: "",
          recurring: 0,
        });

        // Call success callback and close modal
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      const error = err as { code?: string; message?: string };
      if (error?.code) {
        toast.error(
          t(error.code, {
            ns: "errors",
            defaultValue: error.message || t("UNKNOWN_ERROR", { ns: "errors" }),
          })
        );
      } else {
        toast.error(t("UNKNOWN_ERROR", { ns: "errors" }));
      }
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      amount: 0,
      name: "",
      description: "",
      recurring: 0,
    });
    onClose();
  };

  if (!budget) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-[400px] p-0 border-none bg-white rounded-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[18px] md:text-[20px] font-semibold text-[#111827] font-nunito leading-[24px] md:leading-[28px]">
              {t("addExpense")}
            </DialogTitle>
          </div>
          <p className="text-[12px] md:text-[14px] text-[#6B7280] font-nunito leading-[16px] md:leading-[20px] mt-1">
            {t("addExpenseFor")} &ldquo;{budget.name}&rdquo;
          </p>
        </DialogHeader>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="px-4 md:px-6 pb-4 md:pb-6 space-y-4 md:space-y-6"
        >
          {/* Expense Name */}
          <FormInput
            label={t("expenseName")}
            type="text"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            placeholder={t("enterExpenseName")}
            required
            className="w-full"
          />

          {/* Amount */}
          <MoneyInput
            label={t("amount")}
            value={formData.amount.toString()}
            onChange={(value) =>
              setFormData({ ...formData, amount: parseInt(value) || 0 })
            }
            placeholder={t("enterAmount")}
            required
            className="w-full"
          />

          {/* Description */}
          <FormInput
            label={`${t("description")} (${t("optional")})`}
            type="text"
            value={formData.description}
            onChange={(value) =>
              setFormData({ ...formData, description: value })
            }
            placeholder={t("enterDescription")}
            className="w-full"
          />

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="submit"
              className="flex-1 h-10 md:h-12 text-[14px] md:text-[16px] font-nunito bg-[#0055FF] hover:bg-[#0041CC]"
              disabled={isRecording || !formData.name || formData.amount <= 0}
            >
              {isRecording ? t("creating", { ns: "common" }) : t("addExpense")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-10 md:h-12 text-[14px] md:text-[16px] font-nunito"
              disabled={isRecording}
            >
              {t("cancel", { ns: "common" })}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
