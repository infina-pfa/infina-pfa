"use client";

import { useState } from "react";
import { useWithdrawFromGoal } from "@/hooks/swr/goal";
import { useAppTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { GoalResponseDto } from "@/lib/types/goal.types";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WithdrawGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goal: GoalResponseDto | null;
}

export function WithdrawGoalModal({
  isOpen,
  onClose,
  onSuccess,
  goal,
}: WithdrawGoalModalProps) {
  const { t } = useAppTranslation(["goals", "common"]);
  const { success, error: showError } = useToast();
  const { withdrawFromGoal, isWithdrawing } = useWithdrawFromGoal(goal?.id || "");

  // Form state
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [formErrors, setFormErrors] = useState<{
    amount?: string;
    reason?: string;
  }>({});

  // Reset form when modal opens/closes
  const resetForm = () => {
    setAmount("");
    setReason("");
    setFormErrors({});
  };

  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Validate form
  const validateForm = () => {
    const errors: { amount?: string; reason?: string } = {};
    let isValid = true;

    if (!reason.trim()) {
      errors.reason = t("reasonRequired", { ns: "common" });
      isValid = false;
    }

    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      errors.amount = t("amountMustBePositive", { ns: "common" });
      isValid = false;
    }

    // Check if withdrawal amount is greater than current amount
    if (goal && amountValue > goal.currentAmount) {
      errors.amount = t("insufficientFunds", {
        ns: "common",
        available: formatCurrency(goal.currentAmount),
      });
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
      const result = await withdrawFromGoal({
        amount: parseFloat(amount),
      });

      if (result) {
        success(
          t("success", { ns: "common" }),
          t("withdrawSuccess", {
            amount: formatCurrency(parseFloat(amount)),
            goal: goal.title,
          })
        );
        onSuccess();
      }
    } catch (err) {
      console.error("Error withdrawing from goal:", err);
      showError(
        t("error", { ns: "common" }),
        err instanceof Error
          ? err.message
          : t("withdrawFailed", { ns: "common" })
      );
    }
  };

  if (!goal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {t("withdrawFromGoal", { goal: goal.title })}
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
            <p className="text-xs text-[#6B7280]">
              {t("availableBalance", { ns: "common" })}:{" "}
              {formatCurrency(goal.currentAmount)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">{t("withdrawReason")} *</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("enterWithdrawReason")}
              error={!!formErrors.reason}
            />
            {formErrors.reason && (
              <p className="text-[#F44336] text-xs mt-1">{formErrors.reason}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isWithdrawing}
            >
              {t("cancel", { ns: "common" })}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isWithdrawing || goal.currentAmount <= 0}
            >
              {isWithdrawing ? t("withdrawing", { ns: "common" }) : t("withdraw")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
