"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { formatDateVN } from "@/lib/utils/date-formatter";
import { Goal } from "@/lib/types/goal.types";
import { ProgressBar } from "@/components/budgeting/progress-bar";
import { useAppTranslation } from "@/hooks/use-translation";

interface GoalCardProps {
  goal: Goal;
  onEdit: () => void;
}

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const { t } = useAppTranslation(["goals"]);

  // Calculate progress percentage
  const progressPercentage = goal.target_amount
    ? Math.min(
        100,
        Math.round((goal.current_amount / goal.target_amount) * 100)
      )
    : 0;

  return (
    <Card
      className="p-0 border-0 bg-[#FFFFFF] rounded-[12px] shadow-none cursor-pointer hover:bg-[#F0F2F5] transition-colors gap-2"
      onClick={onEdit}
    >
      {/* Top section - horizontal layout with title and current value */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-[16px] md:text-[18px] text-[#111827] font-nunito">
            {goal.title}
          </h3>
          {goal.due_date && (
            <p className="text-[12px] md:text-[14px] text-[#6B7280] font-nunito mt-1">
              {t("dueDate")}: {formatDateVN(goal.due_date)}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[12px] text-[#6B7280] font-nunito">
            {t("currentAmount")}
          </p>
          <p className="font-semibold text-[16px] md:text-[18px] text-[#111827] font-nunito">
            {formatCurrency(goal.current_amount)}
          </p>
        </div>
      </div>

      {/* Middle section - full-width progress bar */}
      <ProgressBar className="" value={progressPercentage} color="#0055FF" />

      {/* Bottom section - horizontal layout with target amount and progress percentage */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[14px] text-[#6B7280] font-nunito">
            {t("targetAmount")}: {formatCurrency(goal.target_amount || 0)}
          </p>
        </div>
        <div>
          <p className="text-[14px] font-medium text-[#2ECC71] font-nunito">
            {t("completed")} {progressPercentage}%
          </p>
        </div>
      </div>
    </Card>
  );
}
