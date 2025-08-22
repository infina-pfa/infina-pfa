"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoneyInput } from "@/components/ui/money-input";
import { FormInput } from "@/components/ui/form-input";
import { useAppTranslation } from "@/hooks/use-translation";
import { useRecordPayment } from "@/hooks/swr/debt";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface PayDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  debt: {
    id: string;
    lender: string;
    amount: number;
    currentPaidAmount: number;
  } | null;
}

export const PayDebtModal = ({
  isOpen,
  onClose,
  onSuccess,
  debt,
}: PayDebtModalProps) => {
  const { t } = useAppTranslation(["debt", "common"]);
  const { recordPayment, isRecording } = useRecordPayment(debt?.id || "");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{
    amount?: string;
    description?: string;
  }>({});

  if (!debt) return null;

  const remainingAmount = debt.amount - debt.currentPaidAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: typeof errors = {};
    if (!paymentAmount || paymentAmount <= 0) {
      newErrors.amount = t("amountRequired");
    } else if (paymentAmount > remainingAmount) {
      newErrors.amount = t("paymentExceedsDebt", { ns: "debt" });
    }

    if (!description.trim()) {
      newErrors.description = t("descriptionRequired", { ns: "debt" });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await recordPayment({
        amount: paymentAmount,
        name: `Payment to ${debt.lender}`,
        description: description.trim(),
      });

      toast.success(t("paymentAddedSuccess"));
      onSuccess();
      handleClose();
    } catch {
      toast.error(t("paymentError", { ns: "debt" }));
    }
  };

  const handleClose = () => {
    if (!isRecording) {
      setPaymentAmount(0);
      setDescription("");
      setErrors({});
      onClose();
    }
  };

  const parseFormattedNumber = (value: string | number): number => {
    if (typeof value === "number") return value;
    const cleanedValue = value.replace(/[^0-9.-]/g, "");
    return parseFloat(cleanedValue) || 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#FFFFFF] border-0 max-w-[90vw] sm:max-w-[480px] rounded-xl p-0 font-nunito">
        <div className="p-4 md:p-6">
          <DialogHeader className="mb-4 md:mb-6">
            <DialogTitle className="text-[18px] md:text-[20px] font-semibold text-[#111827] font-nunito">
              {t("payDebt")}
            </DialogTitle>
          </DialogHeader>

          <div className="mb-4 p-3 bg-[#F0F2F5] rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-nunito">{t("lender")}:</span>
              <span className="font-semibold font-nunito">{debt.lender}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-600 font-nunito">
                {t("remaining")}:
              </span>
              <span className="font-semibold text-[#0055FF] font-nunito">
                {formatCurrency(remainingAmount)}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <MoneyInput
              label={t("paymentAmount", { ns: "debt" })}
              value={paymentAmount}
              onChange={(value) => {
                setPaymentAmount(parseFormattedNumber(value));
                setErrors((prev) => ({ ...prev, amount: undefined }));
              }}
              placeholder={t("enterPaymentAmount", { ns: "debt" })}
              error={errors.amount}
              touched={!!errors.amount}
              required
            />

            <FormInput
              label={t("description", { ns: "common" })}
              value={description}
              onChange={(value) => {
                setDescription(value);
                setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              placeholder={t("enterPaymentDescription", { ns: "debt" })}
              error={errors.description}
              touched={!!errors.description}
              required
            />

            <div className="flex flex-col sm:flex-row-reverse gap-3 pt-3">
              <Button
                type="submit"
                className="flex-1 h-10 md:h-12 bg-[#2ECC71] hover:bg-[#27AE60] text-white font-nunito text-sm md:text-base"
                disabled={isRecording}
              >
                {isRecording
                  ? t("processing", { ns: "common" })
                  : t("payNow", { ns: "debt" })}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-10 md:h-12 text-sm md:text-base font-nunito"
                disabled={isRecording}
              >
                {t("cancel", { ns: "common" })}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
