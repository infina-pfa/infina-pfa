"use client";

import { ProgressBar } from "@/components/budgeting/progress-bar";
import { Card } from "@/components/ui/card";
import { useAppTranslation } from "@/hooks/use-translation";
import { GoalResponseDto } from "@/lib/types/goal.types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusIcon, MinusIcon, PencilIcon, Trash2Icon } from "lucide-react";

interface GoalCardProps {
  goal: GoalResponseDto;
  onEdit: () => void;
  onDeposit: (goalId: string) => void;
  onWithdraw: (goalId: string) => void;
  onDelete?: () => void;
}

export function GoalCard({
  goal,
  onEdit,
  onDeposit,
  onWithdraw,
  onDelete,
}: GoalCardProps) {
  const { t } = useAppTranslation(["goals"]);

  // Calculate progress percentage
  const progressPercentage = goal.targetAmount
    ? Math.min(
        100,
        Math.round((goal.currentAmount / goal.targetAmount) * 100)
      )
    : 0;

  const handleDeposit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeposit(goal.id);
  };

  const handleWithdraw = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWithdraw(goal.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <Card className="mb-4 sm:mb-2 p-4 border-0 bg-[#FFFFFF] rounded-[12px] shadow-none hover:bg-[#F0F2F5] transition-colors gap-2">
      {/* Top section - horizontal layout with title and current value */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-[16px] md:text-[18px] text-[#111827] font-nunito">
            {goal.title}
          </h3>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[12px] text-[#6B7280] font-nunito">
            {t("currentAmount")}
          </p>
          <p className="font-semibold text-[16px] md:text-[18px] text-[#111827] font-nunito">
            {formatCurrency(goal.currentAmount)}
          </p>
        </div>
      </div>

      {goal.targetAmount && (
        <>
          {/* Middle section - full-width progress bar */}
          <ProgressBar value={progressPercentage} color="#0055FF" />

          {/* Bottom section - horizontal layout with target amount and progress percentage */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[14px] text-[#6B7280] font-nunito">
                {t("targetAmount")}: {formatCurrency(goal.targetAmount || 0)}
              </p>
            </div>
            <div>
              <p className="text-[14px] font-medium text-[#2ECC71] font-nunito">
                {t("completed")} {progressPercentage}%
              </p>
            </div>
          </div>
        </>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mt-4 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleEdit}
          className="flex items-center gap-1"
        >
          <PencilIcon size={16} />
          <span className="hidden sm:inline">{t("edit")}</span>
        </Button>
        <Button
          variant="success"
          size="sm"
          onClick={handleDeposit}
          className="flex items-center gap-1"
        >
          <PlusIcon size={16} />
          <span className="hidden sm:inline">{t("deposit")}</span>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleWithdraw}
          className="flex items-center gap-1"
          disabled={goal.currentAmount <= 0}
        >
          <MinusIcon size={16} />
          <span className="hidden sm:inline">{t("withdraw")}</span>
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="flex items-center gap-1 text-red-600 hover:text-red-700"
          >
            <Trash2Icon size={16} />
            <span className="hidden sm:inline">{t("delete")}</span>
          </Button>
        )}
      </div>
    </Card>
  );
}
