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
import { useExpenseCreateSWR } from "@/hooks/swr";
import { useAppTranslation } from "@/hooks/use-translation";
import { CreateExpenseRequest } from "@/lib/types/transaction.types";
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
}

export const CreateExpenseModal = ({
  isOpen,
  onClose,
  onSuccess,
  budget,
}: CreateExpenseModalProps) => {
  const { t } = useAppTranslation(["budgeting", "common"]);
  const { createExpense, isCreating, error } = useExpenseCreateSWR();

  const [formData, setFormData] = useState<
    Omit<CreateExpenseRequest, "budgetId">
  >({
    name: "",
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!budget) return;

    const result = await createExpense({
      ...formData,
      budgetId: budget.id,
    });

    if (result) {
      // Reset form
      setFormData({
        name: "",
        amount: 0,
        description: "",
        date: new Date().toISOString().split("T")[0],
      });

      // Call success callback and close modal
      onSuccess?.();
      onClose();
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: "",
      amount: 0,
      description: "",
      date: new Date().toISOString().split("T")[0],
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

          {/* Date */}
          <FormInput
            label={t("date")}
            type="date"
            value={formData.date}
            onChange={(value) => setFormData({ ...formData, date: value })}
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

          {/* Error Message */}
          {error && (
            <div className="text-[#F44336] text-[12px] md:text-[14px] font-nunito leading-[16px] md:leading-[20px]">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="submit"
              className="flex-1 h-10 md:h-12 text-[14px] md:text-[16px] font-nunito bg-[#0055FF] hover:bg-[#0041CC]"
              disabled={
                isCreating || !formData.name.trim() || formData.amount <= 0
              }
            >
              {isCreating ? t("creating", { ns: "common" }) : t("addExpense")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-10 md:h-12 text-[14px] md:text-[16px] font-nunito"
              disabled={isCreating}
            >
              {t("cancel", { ns: "common" })}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
