"use client";

import { BudgetModal } from "./budget-modal";

interface CreateBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateBudgetModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateBudgetModalProps) => {
  return (
    <BudgetModal
      mode="create"
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};
