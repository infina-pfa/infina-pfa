"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { budgetService } from "@/lib/services/budget.service";
import {
  BudgetResponse,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  BudgetDetailResponse,
} from "@/lib/types/budget.types";

/**
 * Hook for fetching budgets list
 */
export function useBudgets(month: number, year: number) {
  const { data, error, isLoading, mutate } = useSWR(
    ["budgets", month, year],
    () => budgetService.getBudgets(month, year),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    budgets: data as BudgetResponse[] | undefined,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook for fetching budget details with transactions
 */
export function useBudgetDetail(budgetId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    budgetId ? ["budget", budgetId] : null,
    () => budgetService.getBudgetDetail(budgetId!),
    {
      revalidateOnFocus: true,
    }
  );

  return {
    budget: data as BudgetDetailResponse | undefined,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook for creating a budget with optimistic updates
 */
export function useCreateBudget(month: number, year: number) {
  const { mutate: globalMutate } = useSWR(["budgets", month, year]);

  const { trigger, isMutating, error } = useSWRMutation(
    ["budgets", "create"],
    async (_, { arg }: { arg: CreateBudgetRequest }) => {
      // Optimistic update - add temporary budget to list
      const tempBudget: BudgetResponse = {
        id: `temp-${Date.now()}`,
        ...arg,
        userId: "temp",
        spent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await globalMutate(
        async (currentBudgets: BudgetResponse[] | undefined) => {
          try {
            // Create the budget on server
            const newBudget = await budgetService.createBudget(arg);
            // Replace temp budget with real one
            return (currentBudgets || []).concat(newBudget);
          } catch (error) {
            // On error, revert to original
            throw error;
          }
        },
        {
          optimisticData: (current: BudgetResponse[] | undefined) => [...(current || []), tempBudget],
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        }
      );

      return true;
    }
  );

  return {
    createBudget: trigger,
    isCreating: isMutating,
    error,
  };
}

/**
 * Hook for updating a budget with optimistic updates
 */
export function useUpdateBudget(budgetId: string, month: number, year: number) {
  const { mutate: listMutate } = useSWR(["budgets", month, year]);
  const { mutate: detailMutate } = useSWR(["budget", budgetId]);

  const { trigger, isMutating, error } = useSWRMutation(
    ["budget", "update", budgetId],
    async (_, { arg }: { arg: UpdateBudgetRequest }) => {
      // Optimistic update for list
      await listMutate(
        async (currentBudgets: BudgetResponse[] | undefined) => {
          try {
            const updatedBudget = await budgetService.updateBudget(budgetId, arg);
            return (currentBudgets || []).map((b: BudgetResponse) =>
              b.id === budgetId ? updatedBudget : b
            );
          } catch (error) {
            throw error;
          }
        },
        {
          optimisticData: (current: BudgetResponse[] | undefined) =>
            (current || []).map((b: BudgetResponse) => (b.id === budgetId ? { ...b, ...arg } : b)),
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        }
      );

      // Also update detail cache if exists
      if (detailMutate) {
        await detailMutate();
      }

      return true;
    }
  );

  return {
    updateBudget: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Hook for deleting a budget with optimistic updates
 */
export function useDeleteBudget(month: number, year: number) {
  const { mutate: globalMutate } = useSWR(["budgets", month, year]);

  const { trigger, isMutating, error } = useSWRMutation(
    ["budget", "delete"],
    async (_, { arg: budgetId }: { arg: string }) => {
      // Optimistic update - remove budget from list
      await globalMutate(
        async (currentBudgets: BudgetResponse[] | undefined) => {
          const optimisticBudgets = (currentBudgets || []).filter(
            (b: BudgetResponse) => b.id !== budgetId
          );

          try {
            await budgetService.deleteBudget(budgetId);
            return optimisticBudgets;
          } catch (error) {
            throw error;
          }
        },
        {
          optimisticData: (current: BudgetResponse[] | undefined) =>
            (current || []).filter((b: BudgetResponse) => b.id !== budgetId),
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        }
      );

      return true;
    }
  );

  return {
    deleteBudget: trigger,
    isDeleting: isMutating,
    error,
  };
}