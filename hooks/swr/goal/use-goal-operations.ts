"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { goalService } from "@/lib/services/goal.service";
import {
  GoalResponseDto,
  CreateGoalRequest,
  UpdateGoalRequest,
  ContributeGoalRequest,
  WithdrawGoalRequest,
} from "@/lib/types/goal.types";

/**
 * Hook for fetching all goals
 */
export function useGoals() {
  const { data, error, isLoading, mutate } = useSWR(
    ["goals"],
    () => goalService.getGoals(),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    goals: data as GoalResponseDto[] | undefined,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook for creating a new goal
 */
export function useCreateGoal() {
  const { mutate: globalMutate } = useSWR(["goals"]);

  const { trigger, isMutating, error } = useSWRMutation(
    ["goals", "create"],
    async (_, { arg }: { arg: CreateGoalRequest }): Promise<GoalResponseDto> => {
      const newGoal = await goalService.createGoal(arg);
      
      // Invalidate goals list cache
      await globalMutate();
      
      return newGoal;
    }
  );

  return {
    createGoal: trigger,
    isCreating: isMutating,
    error,
  };
}

/**
 * Hook for updating a goal
 */
export function useUpdateGoal(goalId: string) {
  const { mutate: globalMutate } = useSWR(["goals"]);

  const { trigger, isMutating, error } = useSWRMutation(
    ["goal", "update", goalId],
    async (_, { arg }: { arg: UpdateGoalRequest }): Promise<GoalResponseDto> => {
      const updatedGoal = await goalService.updateGoal(goalId, arg);
      
      // Invalidate goals list cache
      await globalMutate();
      
      return updatedGoal;
    }
  );

  return {
    updateGoal: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Hook for contributing to a goal
 */
export function useContributeToGoal(goalId: string) {
  const { mutate: globalMutate } = useSWR(["goals"]);

  const { trigger, isMutating, error } = useSWRMutation(
    ["goal", "contribute", goalId],
    async (_, { arg }: { arg: ContributeGoalRequest }): Promise<GoalResponseDto> => {
      const updatedGoal = await goalService.contributeToGoal(goalId, arg);
      
      // Invalidate goals list cache
      await globalMutate();
      
      return updatedGoal;
    }
  );

  return {
    contributeToGoal: trigger,
    isContributing: isMutating,
    error,
  };
}

/**
 * Hook for withdrawing from a goal
 */
export function useWithdrawFromGoal(goalId: string) {
  const { mutate: globalMutate } = useSWR(["goals"]);

  const { trigger, isMutating, error } = useSWRMutation(
    ["goal", "withdraw", goalId],
    async (_, { arg }: { arg: WithdrawGoalRequest }): Promise<GoalResponseDto> => {
      const updatedGoal = await goalService.withdrawFromGoal(goalId, arg);
      
      // Invalidate goals list cache
      await globalMutate();
      
      return updatedGoal;
    }
  );

  return {
    withdrawFromGoal: trigger,
    isWithdrawing: isMutating,
    error,
  };
}

/**
 * Hook for deleting a goal
 */
export function useDeleteGoal() {
  const { mutate: globalMutate } = useSWR(["goals"]);

  const { trigger, isMutating, error } = useSWRMutation(
    ["goal", "delete"],
    async (_, { arg: goalId }: { arg: string }) => {
      await goalService.deleteGoal(goalId);
      
      // Invalidate goals list cache
      await globalMutate();
    }
  );

  return {
    deleteGoal: trigger,
    isDeleting: isMutating,
    error,
  };
}