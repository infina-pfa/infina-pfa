"use client";

import { IncomeModal } from "./income-modal";
import { Income } from "@/lib/types/income.types";

interface CreateIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onIncomeCreated?: (income: Income) => Promise<void>;
}

export function CreateIncomeModal({
  isOpen,
  onClose,
  onSuccess,
  onIncomeCreated,
}: CreateIncomeModalProps) {
  return (
    <IncomeModal
      mode="create"
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      onIncomeCreated={onIncomeCreated}
    />
  );
}
