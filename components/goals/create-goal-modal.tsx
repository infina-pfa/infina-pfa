"use client";

import { GoalModal } from "./goal-modal";
import { GoalResponseDto } from "@/lib/types/goal.types";

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onGoalCreated?: (goal: GoalResponseDto) => Promise<void>;
}

export function CreateGoalModal({
  isOpen,
  onClose,
  onSuccess,
  onGoalCreated,
}: CreateGoalModalProps) {
  return (
    <GoalModal
      mode="create"
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      onGoalCreated={onGoalCreated}
    />
  );
}
