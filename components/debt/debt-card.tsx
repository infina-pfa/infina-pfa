"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useAppTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { MoreVertical, Edit2, Trash2, DollarSign } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface DebtCardProps {
  debt: {
    id: string;
    lender: string;
    purpose: string;
    amount: number;
    currentPaidAmount: number;
    dueDate: string;
    rate: number;
  };
  onEdit?: (debt: DebtCardProps["debt"]) => void;
  onDelete?: (debtId: string) => void;
  onPay?: (debt: DebtCardProps["debt"]) => void;
}

export function DebtCard({ debt, onEdit, onDelete, onPay }: DebtCardProps) {
  const { t } = useAppTranslation(["debt", "common"]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const remainingAmount = debt.amount - debt.currentPaidAmount;
  const progressPercentage = (debt.currentPaidAmount / debt.amount) * 100;

  const handleMenuItemClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
    setIsMenuOpen(false);
  };

  return (
    <Card className="p-4 border-none bg-white hover:bg-gray-50 transition-colors">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold font-nunito text-gray-900">
              {debt.lender}
            </h3>
            <p className="text-sm text-gray-600 font-nunito">{debt.purpose}</p>
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
                  onClick={(e) => handleMenuItemClick(e, () => onEdit?.(debt))}
                >
                  <Edit2 className="mr-2 h-4 w-4 text-[#0055FF]" />
                  <span>{t("edit", { ns: "common" })}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer font-nunito text-red-600"
                  onClick={(e) => handleMenuItemClick(e, () => onDelete?.(debt.id))}
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
    </Card>
  );
}