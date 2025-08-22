"use client";

import { DebtModal } from "./debt-modal";
import { DebtResponse } from "@/lib/types/debt.types";

interface CreateDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDebtCreated?: (debt: DebtResponse) => Promise<void>;
}

export const CreateDebtModal = ({
  isOpen,
  onClose,
  onSuccess,
  onDebtCreated,
}: CreateDebtModalProps) => {
  return (
    <DebtModal
      mode="create"
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      onDebtCreated={onDebtCreated}
    />
  );
};