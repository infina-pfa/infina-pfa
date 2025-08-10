"use client";

import { useState } from "react";
import { useGoalDeposit } from "@/hooks/swr-v2";
import { useAppTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { Goal } from "@/lib/types/goal.types";
import { formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";

interface DepositGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goal: Goal | null;
}

export function DepositGoalModal({
  isOpen,
  onClose,
  onSuccess,
  goal,
}: DepositGoalModalProps) {
  const { t } = useAppTranslation(["goals", "common"]);
  const { success, error: showError } = useToast();
  const { deposit, isLoading } = useGoalDeposit();

  // Form state
  const [amount, setAmount] = useState("");
  const [formErrors, setFormErrors] = useState<{
    amount?: string;
  }>({});

  // Reset form when modal opens/closes
  const resetForm = () => {
    setAmount("");
    setFormErrors({});
  };

  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Validate form
  const validateForm = () => {
    const errors: { amount?: string } = {};
    let isValid = true;

    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      errors.amount = t("amountMustBePositive", { ns: "common" });
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!goal) return;
    if (!validateForm()) return;

    try {
      const result = await deposit(goal.id, {
        name: `${goal.title}`,
        amount: parseFloat(amount),
        description: "",
      });

      if (result) {
        success(
          t("success", { ns: "common" }),
          t("depositSuccess", {
            amount: formatCurrency(parseFloat(amount)),
            goal: goal.title,
          })
        );
        onSuccess();
      }
    } catch (err) {
      console.error("Error depositing to goal:", err);
      showError(
        t("error", { ns: "common" }),
        err instanceof Error
          ? err.message
          : t("depositFailed", { ns: "common" })
      );
    }
  };

  if (!goal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {t("depositToGoal", { goal: goal.title })}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <MoneyInput
              label={t("amount", { ns: "common" })}
              value={amount}
              onChange={(value) => setAmount(value)}
              error={formErrors.amount}
              placeholder="0.00"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t("cancel", { ns: "common" })}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("depositing", { ns: "common" }) : t("deposit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
