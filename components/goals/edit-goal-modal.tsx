"use client";

import { GoalModal } from "./goal-modal";
import { GoalResponseDto } from "@/lib/types/goal.types";

interface EditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goal: GoalResponseDto | null;
  onGoalUpdated?: (goal: GoalResponseDto) => Promise<void>;
}

export function EditGoalModal({
  isOpen,
  onClose,
  onSuccess,
  goal,
  onGoalUpdated,
}: EditGoalModalProps) {
  return (
    <GoalModal
      mode="edit"
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      goal={goal}
      onGoalUpdated={onGoalUpdated}
    />
  );
}
