"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useDeletePayment } from "@/hooks/swr/debt";
import { useAppTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { DollarSign, Edit2, MoreVertical, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PaymentList } from "./payment-list";

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

interface DebtCardProps {
  debt: {
    id: string;
    lender: string;
    purpose: string;
    amount: number;
    currentPaidAmount: number;
    dueDate: string;
    rate: number;
    payments?: Payment[];
  };
  onEdit?: (debt: DebtCardProps["debt"]) => void;
  onDelete?: (debtId: string) => void;
  onPay?: (debt: DebtCardProps["debt"]) => void;
  onPaymentDeleted?: () => void;
}

export function DebtCard({ debt, onEdit, onDelete, onPay, onPaymentDeleted }: DebtCardProps) {
  const { t } = useAppTranslation(["debt", "common"]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const { deletePayment } = useDeletePayment(debt.id);
  const remainingAmount = debt.amount - debt.currentPaidAmount;
  const progressPercentage = (debt.currentPaidAmount / debt.amount) * 100;

  const handleMenuItemClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
    setIsMenuOpen(false);
  };

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDeletePaymentClick = (paymentId: string) => {
    setDeletePaymentId(paymentId);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDeletePayment = async () => {
    if (!deletePaymentId) return;
    
    try {
      await deletePayment(deletePaymentId);
      toast.success(t("paymentDeletedSuccess", { ns: "debt" }));
      // Call parent callback to refresh the debts list
      if (onPaymentDeleted) {
        onPaymentDeleted();
      }
    } catch {
      toast.error(t("paymentDeleteError", { ns: "debt" }));
    } finally {
      setIsDeleteAlertOpen(false);
      setDeletePaymentId(null);
    }
  };

  return (
    <Card className="border-none bg-white transition-all duration-200 p-0">
      <div
        className="p-4 hover:bg-gray-50 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 flex items-start gap-2">
              <div className="mt-1">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-semibold font-nunito text-gray-900">
                  {debt.lender}
                </h3>
                <p className="text-sm text-gray-600 font-nunito">
                  {debt.purpose}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-right">
                <p className="font-semibold text-[#0055FF] font-nunito">
                  {formatCurrency(remainingAmount)}
                </p>
                <p className="text-xs text-gray-500 font-nunito">
                  {t("remaining")}
                </p>
              </div>
              <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    className="cursor-pointer font-nunito"
                    onClick={(e) => handleMenuItemClick(e, () => onPay?.(debt))}
                  >
                    <DollarSign className="mr-2 h-4 w-4 text-[#2ECC71]" />
                    <span>{t("payDebt")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer font-nunito"
                    onClick={(e) =>
                      handleMenuItemClick(e, () => onEdit?.(debt))
                    }
                  >
                    <Edit2 className="mr-2 h-4 w-4 text-[#0055FF]" />
                    <span>{t("edit", { ns: "common" })}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer font-nunito text-red-600"
                    onClick={(e) =>
                      handleMenuItemClick(e, () => onDelete?.(debt.id))
                    }
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>{t("delete", { ns: "common" })}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#2ECC71] h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-nunito">
              {t("paidAmount")}: {formatCurrency(debt.currentPaidAmount)}
            </span>
            <span className="text-gray-600 font-nunito">
              {t("dueDate")}: {format(new Date(debt.dueDate), "dd/MM/yyyy")}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Payment History Section */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          <PaymentList
            payments={debt.payments}
            onDeletePayment={handleDeletePaymentClick}
            isLoading={false}
          />
        </div>
      )}

      {/* Delete Payment Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="font-nunito">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDeletePayment", { ns: "debt" })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDebtWarning", { ns: "debt" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setIsDeleteAlertOpen(false);
                setDeletePaymentId(null);
              }}
              className="font-nunito"
            >
              {t("cancel", { ns: "common" })}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDeletePayment}
              className="bg-red-600 hover:bg-red-700 font-nunito"
            >
              {t("delete", { ns: "common" })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
