"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { formatDateVN } from "@/lib/utils/date-formatter";
import { Goal } from "@/lib/types/goal.types";
import { ProgressBar } from "@/components/budgeting/progress-bar";
import { Edit, Trash2 } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";

interface GoalCardProps {
  goal: Goal;
  onEdit: () => void;
  onDelete: () => void;
}

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const { t } = useAppTranslation(["goals"]);

  // Calculate progress percentage
  const progressPercentage = goal.target_amount
    ? Math.min(
        100,
        Math.round((goal.current_amount / goal.target_amount) * 100)
      )
    : 0;

  // Calculate remaining amount
  const remainingAmount = goal.target_amount
    ? Math.max(0, goal.target_amount - goal.current_amount)
    : 0;

  // Check if goal is completed
  const isCompleted =
    goal.target_amount && goal.current_amount >= goal.target_amount;

  return (
    <Card className="p-4 md:p-5 border-0 bg-[#FFFFFF] rounded-[12px] shadow-none">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-[16px] md:text-[18px] text-[#111827] font-nunito">
            {goal.title}
          </h3>
          {goal.due_date && (
            <p className="text-[12px] md:text-[14px] text-[#6B7280] font-nunito mt-1">
              {t("dueDate")}: {formatDateVN(goal.due_date)}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-1 rounded-full hover:bg-[#F0F2F5]"
            aria-label={t("edit")}
          >
            <Edit className="h-4 w-4 text-[#6B7280]" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded-full hover:bg-[#F0F2F5]"
            aria-label={t("delete")}
          >
            <Trash2 className="h-4 w-4 text-[#6B7280]" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-[12px] md:text-[14px] mb-1 font-nunito">
          <span className="text-[#6B7280]">{t("progress")}</span>
          <span className="text-[#111827] font-medium">
            {progressPercentage}%
          </span>
        </div>
        <ProgressBar value={progressPercentage} color="#0055FF" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="p-3 bg-[#F0F2F5] rounded-[8px]">
          <p className="text-[12px] text-[#6B7280] font-nunito mb-1">
            {isCompleted ? t("completed") : t("currentAmount")}
          </p>
          <p className="font-semibold text-[14px] md:text-[16px] text-[#111827] font-nunito">
            {formatCurrency(goal.current_amount)}
          </p>
        </div>
        <div className="p-3 bg-[#F0F2F5] rounded-[8px]">
          <p className="text-[12px] text-[#6B7280] font-nunito mb-1">
            {isCompleted ? t("targetAmount") : t("remaining")}
          </p>
          <p className="font-semibold text-[14px] md:text-[16px] text-[#111827] font-nunito">
            {formatCurrency(
              isCompleted && goal.target_amount
                ? goal.target_amount
                : remainingAmount
            )}
          </p>
        </div>
      </div>
    </Card>
  );
}
