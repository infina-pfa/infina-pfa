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
import { useUpdateExpense } from "@/hooks/swr/budget/use-expense-update";
import { useToast } from "@/hooks/use-toast";
import { useAppTranslation } from "@/hooks/use-translation";
import { UpdateExpenseRequest } from "@/lib/types/transaction.types";
import { useEffect, useState } from "react";

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (name: string, amount: number, oldAmount?: number) => void;
  expense: {
    id: string;
    name: string;
    amount: number;
    description?: string | null;
    date: string;
    budgetName?: string;
  } | null;
}

export const EditExpenseModal = ({
  isOpen,
  onClose,
  onSuccess,
  expense,
}: EditExpenseModalProps) => {
  const { t } = useAppTranslation(["budgeting", "common"]);
  const { updateExpense, isUpdating, error } = useUpdateExpense();
  const { success: showSuccessToast } = useToast();

  const [formData, setFormData] = useState<UpdateExpenseRequest>({
    name: "",
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Populate form when expense changes
  useEffect(() => {
    if (expense) {
      // Convert date format from MM/DD/YYYY to YYYY-MM-DD
      let formattedDate = expense.date;

      // Check if the date is in MM/DD/YYYY format
      if (expense.date && expense.date.includes("/")) {
        const dateParts = expense.date.split("/");
        // Assuming MM/DD/YYYY format
        if (dateParts.length === 3) {
          formattedDate = `${dateParts[2]}-${dateParts[0].padStart(
            2,
            "0"
          )}-${dateParts[1].padStart(2, "0")}`;
        }
      }

      setFormData({
        name: expense.name,
        amount: expense.amount,
        description: expense.description || "",
        date: formattedDate,
      });
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!expense) return;

    const result = await updateExpense(expense.id, formData);

    if (result) {
      // Show success toast
      showSuccessToast(t("expenseUpdated"));

      // Call success callback and close modal
      onSuccess?.(expense.name, formData.amount || 0, expense.amount);
      onClose();
    }
  };

  const handleClose = () => {
    // Reset form when closing
    if (expense) {
      setFormData({
        name: expense.name,
        amount: expense.amount,
        description: expense.description || "",
        date: expense.date,
      });
    }
    onClose();
  };

  if (!expense) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-[400px] p-0 border-none bg-white rounded-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[18px] md:text-[20px] font-semibold text-[#111827] font-nunito leading-[24px] md:leading-[28px]">
              {t("editExpense")}
            </DialogTitle>
          </div>
          {expense.budgetName && (
            <p className="text-[12px] md:text-[14px] text-[#6B7280] font-nunito leading-[16px] md:leading-[20px] mt-1">
              {t("editExpenseFor")} &ldquo;{expense.budgetName}&rdquo;
            </p>
          )}
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
            value={formData.name || ""}
            onChange={(value) => setFormData({ ...formData, name: value })}
            placeholder={t("enterExpenseName")}
            required
            className="w-full"
          />

          {/* Amount */}
          <MoneyInput
            label={t("amount")}
            value={formData.amount?.toString() || "0"}
            onChange={(value) =>
              setFormData({ ...formData, amount: parseInt(value) || 0 })
            }
            placeholder={t("enterAmount")}
            required
            className="w-full"
          />

          {/* Date */}
          <FormInput
            label={t("date")}
            type="date"
            value={formData.date || ""}
            onChange={(value) => setFormData({ ...formData, date: value })}
            required
            className="w-full"
          />

          {/* Description */}
          <FormInput
            label={`${t("description")} (${t("optional")})`}
            type="text"
            value={formData.description || ""}
            onChange={(value) =>
              setFormData({ ...formData, description: value })
            }
            placeholder={t("enterDescription")}
            className="w-full"
          />

          {/* Error Message */}
          {error && (
            <div className="text-[#F44336] text-[12px] md:text-[14px] font-nunito leading-[16px] md:leading-[20px]">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-10 md:h-12 text-[14px] md:text-[16px] font-nunito"
              disabled={isUpdating}
            >
              {t("cancel", { ns: "common" })}
            </Button>
            <Button
              type="submit"
              className="flex-1 h-10 md:h-12 text-[14px] md:text-[16px] font-nunito bg-[#0055FF] hover:bg-[#0041CC]"
              disabled={
                isUpdating ||
                !formData.name?.trim() ||
                !formData.amount ||
                formData.amount <= 0
              }
            >
              {isUpdating ? t("updating", { ns: "common" }) : t("editExpense")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
