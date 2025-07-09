"use client";

import { GoalCard } from "./goal-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppTranslation } from "@/hooks/use-translation";
import { Goal } from "@/lib/types/goal.types";

interface GoalListProps {
  goals: Goal[];
  onCreateGoal: () => void;
  onEditGoal: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  loading?: boolean;
}

export function GoalList({
  goals,
  onCreateGoal,
  onEditGoal,
  onDeleteGoal,
  loading = false,
}: GoalListProps) {
  const { t } = useAppTranslation(["goals"]);

  return (
    <div className="bg-[#FFFFFF] rounded-[12px] px-4 py-2 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[18px] md:text-[20px] font-bold text-[#111827] font-nunito">
          {t("goalsList")}
        </h2>
        <Button
          variant="ghost"
          onClick={onCreateGoal}
          className="text-primary font-nunito text-[14px] pl-4 pr-0"
        >
          {t("addNewGoal")}
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-[#F0F2F5] h-[180px] rounded-[12px]"
            ></div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <Card className="p-6 text-center bg-[#F0F2F5] border-0 rounded-[12px]">
          <p className="text-[#6B7280] font-nunito">{t("noGoalsFound")}</p>
        </Card>
      ) : (
        <div>
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={() => onEditGoal(goal.id)}
              // onDelete={() => onDeleteGoal(goal.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
