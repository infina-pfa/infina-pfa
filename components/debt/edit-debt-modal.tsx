"use client";

import { DebtModal } from "./debt-modal";
import { DebtResponse } from "@/lib/types/debt.types";

interface EditDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  debt: DebtResponse | null;
  onDebtUpdated?: (debt: DebtResponse) => Promise<void>;
}

export const EditDebtModal = ({
  isOpen,
  onClose,
  onSuccess,
  debt,
  onDebtUpdated,
}: EditDebtModalProps) => {
  return (
    <DebtModal
      mode="edit"
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      debt={debt}
      onDebtUpdated={onDebtUpdated}
    />
  );
};