"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppTranslation } from "@/hooks/use-translation";
import { useDeleteDebt } from "@/hooks/swr/debt";
import { Plus } from "lucide-react";
import { DebtCard } from "./debt-card";
import { CreateDebtModal } from "./create-debt-modal";
import { EditDebtModal } from "./edit-debt-modal";
import { PayDebtModal } from "./pay-debt-modal";
import { toast } from "sonner";
import { DebtResponse } from "@/lib/types/debt.types";

interface Payment {
  id: string;
  name: string;
  description: string;
  amount: number;
  type?: string;
  recurring?: number;
  createdAt: string;
  updatedAt: string;
}

interface DebtItem {
  id: string;
  lender: string;
  purpose: string;
  amount: number;
  currentPaidAmount: number;
  dueDate: string;
  rate: number;
  payments?: Payment[];
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
  const [deleteDebtId, setDeleteDebtId] = useState<string | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

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

  const handleDeleteClick = (debtId: string) => {
    setDeleteDebtId(debtId);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteDebtId) return;
    
    try {
      await deleteDebt(deleteDebtId);
      toast.success(t("debtDeletedSuccess"));
      if (onDebtDeleted) {
        onDebtDeleted();
      }
    } catch {
      toast.error(t("debtDeleteError", { ns: "debt" }));
    } finally {
      setIsDeleteAlertOpen(false);
      setDeleteDebtId(null);
    }
  };

  const handlePay = (debt: DebtItem) => {
    setSelectedDebt(debt);
    setIsPayModalOpen(true);
  };

  const handlePaySuccess = () => {
    setIsPayModalOpen(false);
    setSelectedDebt(null);
    // Trigger refresh of debts list after payment
    if (onDebtUpdated) {
      onDebtUpdated();
    }
  };

  const handlePaymentDeleted = () => {
    // Trigger refresh of debts list after payment deletion
    if (onDebtUpdated) {
      onDebtUpdated();
    }
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
                onDelete={handleDeleteClick}
                onPay={handlePay}
                onPaymentDeleted={handlePaymentDeleted}
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

      {/* Delete Debt Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="font-nunito">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDeleteDebt")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDebtWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setIsDeleteAlertOpen(false);
                setDeleteDebtId(null);
              }}
              className="font-nunito"
            >
              {t("cancel", { ns: "common" })}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 font-nunito"
            >
              {t("delete", { ns: "common" })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
