import { useGoalListSWR } from "./use-goal-list";
import { useGoalCreateSWR } from "./use-goal-create";
import { useGoalUpdateSWR } from "./use-goal-update";
import { useGoalDeleteSWR } from "./use-goal-delete";
import type { GoalFilters } from "@/lib/types/goal.types";

interface UseGoalManagementSWRProps {
  filters?: GoalFilters;
}

export function useGoalManagementSWR({
  filters,
}: UseGoalManagementSWRProps = {}) {
  const list = useGoalListSWR(filters);
  const create = useGoalCreateSWR();
  const update = useGoalUpdateSWR();
  const remove = useGoalDeleteSWR();

  return {
    // List operations
    goals: list.goals,
    loading: list.loading,
    error: list.error || create.error || update.error || remove.error,
    refetch: list.refetch,

    // Create operations
    createGoal: create.createGoal,
    isCreating: create.isCreating,

    // Update operations
    updateGoal: update.updateGoal,
    isUpdating: update.isUpdating,

    // Delete operations
    deleteGoal: remove.deleteGoal,
    isDeleting: remove.isDeleting,
  };
}
