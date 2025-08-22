"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppTranslation } from "@/hooks/use-translation";
import { useDeleteDebt } from "@/hooks/swr/debt";
import { Plus } from "lucide-react";
import { DebtCard } from "./debt-card";
import { CreateDebtModal } from "./create-debt-modal";
import { EditDebtModal } from "./edit-debt-modal";
import { PayDebtModal } from "./pay-debt-modal";
import { toast } from "sonner";
import { DebtResponse } from "@/lib/types/debt.types";

interface DebtItem {
  id: string;
  lender: string;
  purpose: string;
  amount: number;
  currentPaidAmount: number;
  dueDate: string;
  rate: number;
}

interface DebtListProps {
  debts: DebtItem[] | undefined;
  onAddDebt?: () => void;
  onDebtCreated?: () => void;
  onDebtUpdated?: () => void;
  onDebtDeleted?: () => void;
}

export function DebtList({
  debts,
  onAddDebt,
  onDebtCreated,
  onDebtUpdated,
  onDebtDeleted,
}: DebtListProps) {
  const { t } = useAppTranslation(["debt", "common"]);
  const { deleteDebt } = useDeleteDebt();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<DebtItem | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  const handleAddDebt = () => {
    if (onAddDebt) {
      onAddDebt();
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    if (onDebtCreated) {
      onDebtCreated();
    }
  };

  const handleEdit = (debt: DebtItem) => {
    setSelectedDebt(debt);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedDebt(null);
    if (onDebtUpdated) {
      onDebtUpdated();
    }
  };

  const handleDelete = async (debtId: string) => {
    // Show confirmation dialog
    if (
      window.confirm(t("confirmDeleteDebt") + "\n" + t("deleteDebtWarning"))
    ) {
      try {
        await deleteDebt(debtId);
        toast.success(t("debtDeletedSuccess"));
        if (onDebtDeleted) {
          onDebtDeleted();
        }
      } catch {
        toast.error(t("debtDeleteError", { ns: "debt" }));
      }
    }
  };

  const handlePay = (debt: DebtItem) => {
    setSelectedDebt(debt);
    setIsPayModalOpen(true);
  };

  const handlePaySuccess = () => {
    setIsPayModalOpen(false);
    setSelectedDebt(null);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold font-nunito">{t("debts")}</h2>
          <Button
            className="bg-[#0055FF] hover:bg-[#0044DD] text-white font-nunito"
            onClick={handleAddDebt}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("createDebt")}
          </Button>
        </div>

        {!debts || debts.length === 0 ? (
          <Card className="p-8 text-center border-none bg-white">
            <p className="text-gray-500 font-nunito">{t("noDebtsFound")}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {debts.map((debt) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPay={handlePay}
              />
            ))}
          </div>
        )}
      </div>

      <CreateDebtModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditDebtModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDebt(null);
        }}
        onSuccess={handleEditSuccess}
        debt={selectedDebt as DebtResponse}
      />

      <PayDebtModal
        isOpen={isPayModalOpen}
        onClose={() => {
          setIsPayModalOpen(false);
          setSelectedDebt(null);
        }}
        onSuccess={handlePaySuccess}
        debt={selectedDebt}
      />
    </>
  );
}
