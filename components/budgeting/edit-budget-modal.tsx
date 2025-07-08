"use client";

import { BudgetModal } from "./budget-modal";
import { Budget } from "@/lib/types/budget.types";

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  budget: Budget | null;
  onBudgetUpdated?: (budget: Budget, oldAmount?: number) => Promise<void>;
}

export const EditBudgetModal = ({
  isOpen,
  onClose,
  onSuccess,
  budget,
  onBudgetUpdated,
}: EditBudgetModalProps) => {
  return (
    <BudgetModal
      mode="edit"
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      budget={budget}
      onBudgetUpdated={onBudgetUpdated}
    />
  );
};
