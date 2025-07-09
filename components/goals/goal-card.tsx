"use client";

import { ProgressBar } from "@/components/budgeting/progress-bar";
import { Card } from "@/components/ui/card";
import { useAppTranslation } from "@/hooks/use-translation";
import { Goal } from "@/lib/types/goal.types";
import { formatCurrency } from "@/lib/utils";

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
      className="mb-4 sm:mb-2 p-0 sm:p-4 border-0 bg-[#FFFFFF] rounded-[12px] shadow-none cursor-pointer hover:bg-[#F0F2F5] transition-colors gap-2"
      onClick={onEdit}
    >
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
            {formatCurrency(goal.current_amount)}
          </p>
        </div>
      </div>

      {goal.target_amount && (
        <>
          {/* Middle section - full-width progress bar */}
          <ProgressBar value={progressPercentage} color="#0055FF" />

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
        </>
      )}
    </Card>
  );
}
