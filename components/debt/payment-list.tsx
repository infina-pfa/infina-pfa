"use client";

import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useAppTranslation } from "@/hooks/use-translation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Payment {
  id: string;
  name: string;
  description: string;
  amount: number;
  createdAt: string;
}

interface PaymentListProps {
  payments: Payment[] | undefined;
  onDeletePayment?: (paymentId: string) => void;
  isLoading?: boolean;
}

export function PaymentList({ payments, onDeletePayment, isLoading }: PaymentListProps) {
  const { t } = useAppTranslation(["debt", "common"]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500 font-nunito">{t("noPaymentsYet", { ns: "debt" })}</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <h4 className="text-sm font-semibold text-gray-700 font-nunito mb-3">
        {t("paymentHistory", { ns: "debt" })}
      </h4>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="flex justify-between items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900 font-nunito">
                    {payment.description || payment.name}
                  </p>
                  <p className="text-xs text-gray-500 font-nunito">
                    {format(new Date(payment.createdAt), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#2ECC71] font-nunito">
                    {formatCurrency(payment.amount)}
                  </span>
                  {onDeletePayment && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-red-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePayment(payment.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}