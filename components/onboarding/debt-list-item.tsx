"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, getDaysLeft } from "@/lib/utils";
import { formatDateVN } from "@/lib/utils/date-formatter";
import { useAppTranslation } from "@/hooks/use-translation";

export interface DebtListItemProps {
  id?: string;
  lender: string;
  purpose: string;
  rate: number;
  dueDate: string;
  amount: number;
  currentPaidAmount: number;
  onClick?: () => void;
  className?: string;
}

export function DebtListItem({
  id,
  lender,
  purpose,
  rate: interestRate,
  dueDate,
  amount: totalAmount,
  currentPaidAmount: paidAmount,
  onClick,
  className,
}: DebtListItemProps) {
  const { t } = useAppTranslation(["debt", "common"]);

  // Calculate remaining amount
  const remainingAmount = Math.max(totalAmount - paidAmount, 0);

  // Calculate days left
  const daysLeft = getDaysLeft(dueDate);

  // Determine status color based on time remaining and payment status
  const getStatusColor = () => {
    if (remainingAmount === 0) return "text-[#2ECC71]"; // Green for completed
    if (daysLeft <= 30) return "text-[#F44336]"; // Red for urgent
    if (daysLeft <= 90) return "text-[#FFC107]"; // Yellow for warning
    return "text-[#0055FF]"; // Blue for normal
  };

  const getStatusText = () => {
    if (remainingAmount === 0) return t("completed", { ns: "common" });
    if (daysLeft <= 30) return t("urgent", { ns: "debt" });
    if (daysLeft <= 90) return t("warning", { ns: "debt" });
    return t("onTrack", { ns: "debt" });
  };

  const handleClick = () => {
    onClick?.();
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:bg-[#F0F2F5] ${className}`}
      onClick={handleClick}
      data-debt-id={id}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left section - Debt info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-base text-gray-900 leading-tight">
                  {lender}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{purpose}</p>
              </div>
              <div className="text-right ml-4">
                <p className="font-bold text-lg text-gray-900">
                  {formatCurrency(totalAmount)}
                </p>
                <p className={`text-sm font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </p>
              </div>
            </div>

            {/* Bottom row - Due date and remaining amount */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-gray-500">
                    {t("dueDate", { ns: "debt" })}:{" "}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatDateVN(dueDate)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">{interestRate}%/</span>
                  <span className="text-gray-500">
                    {t("year", { ns: "common" })}
                  </span>
                </div>
                {daysLeft > 0 && (
                  <div>
                    <span className="text-gray-500">
                      {t("timeLeft", { ns: "debt" })}:{" "}
                    </span>
                    <span className={`font-medium ${getStatusColor()}`}>
                      {daysLeft}{" "}
                      {daysLeft === 1
                        ? t("day", { ns: "common" })
                        : t("days", { ns: "common" })}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-right">
                <span className="text-gray-500 text-xs">
                  {remainingAmount === 0
                    ? t("paidAmount", { ns: "debt" })
                    : t("remainingAmount", { ns: "debt" })}
                  :
                </span>
                <span className={`font-semibold ml-1 ${getStatusColor()}`}>
                  {remainingAmount === 0
                    ? formatCurrency(paidAmount)
                    : formatCurrency(remainingAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
