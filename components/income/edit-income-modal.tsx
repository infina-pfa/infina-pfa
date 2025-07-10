"use client";

import { IncomeModal } from "./income-modal";
import { Income } from "@/lib/types/income.types";

interface EditIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  income: Income | null;
  onIncomeUpdated?: (income: Income) => Promise<void>;
}

export function EditIncomeModal({
  isOpen,
  onClose,
  onSuccess,
  income,
  onIncomeUpdated,
}: EditIncomeModalProps) {
  return (
    <IncomeModal
      mode="edit"
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      income={income}
      onIncomeUpdated={onIncomeUpdated}
    />
  );
}
