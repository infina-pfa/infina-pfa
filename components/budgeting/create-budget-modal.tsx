"use client";

import { BudgetModal } from "./budget-modal";

import { Budget } from "@/lib/types/budget.types";

interface CreateBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onBudgetCreated?: (budget: Budget) => Promise<void>;
}

export const CreateBudgetModal = ({
  isOpen,
  onClose,
  onSuccess,
  onBudgetCreated,
}: CreateBudgetModalProps) => {
  return (
    <BudgetModal
      mode="create"
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      onBudgetCreated={onBudgetCreated}
    />
  );
};
