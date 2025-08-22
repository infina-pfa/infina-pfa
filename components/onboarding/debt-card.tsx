"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, getDaysLeft } from "@/lib/utils";
import { formatDateVN } from "@/lib/utils/date-formatter";
import { useAppTranslation } from "@/hooks/use-translation";

export interface DebtCardProps {
  id?: string;
  lender: string;
  purpose: string;
  interestRate: number;
  dueDate: string;
  amount: number;
  currentPaidAmount: number;
  onClick?: () => void;
  className?: string;
}

export function DebtCard({
  id,
  lender,
  purpose,
  interestRate,
  dueDate,
  amount: totalAmount,
  currentPaidAmount: paidAmount,
  onClick,
  className,
}: DebtCardProps) {
  const { t } = useAppTranslation(["debt", "common"]);

  // Calculate progress percentage
  const progressPercentage = Math.min((paidAmount / totalAmount) * 100, 100);

  // Calculate remaining amount
  const remainingAmount = Math.max(totalAmount - paidAmount, 0);

  // Calculate days left
  const daysLeft = getDaysLeft(dueDate);

  // Determine status color based on progress and time remaining
  const getStatusColor = () => {
    if (progressPercentage >= 100) return "text-[#2ECC71]"; // Green for completed
    if (daysLeft <= 30) return "text-[#F44336]"; // Red for urgent
    if (daysLeft <= 90) return "text-[#FFC107]"; // Yellow for warning
    return "text-[#0055FF]"; // Blue for normal
  };

  // Get progress bar color
  const getProgressColor = () => {
    if (progressPercentage >= 100) return "bg-[#2ECC71]";
    if (daysLeft <= 30) return "bg-[#F44336]";
    if (daysLeft <= 90) return "bg-[#FFC107]";
    return "bg-[#0055FF]";
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
      <CardContent className="p-0">
        {/* Header with debt name and total amount */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-base text-gray-900 mb-1 leading-tight">
              {lender}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{purpose}</p>
            <p className="text-xs text-gray-500">
              {interestRate}%/{t("year", { ns: "common" })}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-gray-900">
              {formatCurrency(totalAmount)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Bottom section with due date and progress info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-gray-500 text-xs mb-1">
                {t("dueDate", { ns: "debt" })}
              </p>
              <p className="font-medium text-gray-900">
                {formatDateVN(dueDate)}
              </p>
            </div>
            {daysLeft > 0 && (
              <div>
                <p className="text-gray-500 text-xs mb-1">
                  {t("timeLeft", { ns: "debt" })}
                </p>
                <p className={`font-medium ${getStatusColor()}`}>
                  {daysLeft}{" "}
                  {daysLeft === 1
                    ? t("day", { ns: "common" })
                    : t("days", { ns: "common" })}
                </p>
              </div>
            )}
          </div>

          <div className="text-right">
            <p className="text-gray-500 text-xs mb-1">
              {progressPercentage >= 100
                ? t("paidAmount", { ns: "debt" })
                : t("remainingAmount", { ns: "debt" })}
            </p>
            <p className={`font-semibold ${getStatusColor()}`}>
              {progressPercentage >= 100
                ? formatCurrency(paidAmount)
                : formatCurrency(remainingAmount)}
            </p>
            {progressPercentage < 100 && (
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(progressPercentage)}%{" "}
                {t("completed", { ns: "debt" })}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
