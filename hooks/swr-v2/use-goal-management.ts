"use client";

import {
  useGoalListSWR,
  useGoalCreateSWR,
  useGoalUpdateSWR,
  useGoalDeleteSWR,
} from "@/hooks/swr-v2";

export function useGoalManagementSWR() {
  // Use the individual SWR hooks
  const {
    goals,
    loading: listLoading,
    error: listError,
    refetch,
  } = useGoalListSWR();
  const { createGoal, isCreating, error: createError } = useGoalCreateSWR({});
  const { updateGoal, isUpdating, error: updateError } = useGoalUpdateSWR({});
  const { deleteGoal, isDeleting, error: deleteError } = useGoalDeleteSWR({});

  // Combine loading states
  const loading = listLoading || isCreating || isUpdating || isDeleting;

  // Combine errors (return the first non-null error)
  const error = listError || createError || updateError || deleteError;

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    refetch,
  };
}
