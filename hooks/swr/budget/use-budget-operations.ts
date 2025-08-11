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
    async (_, { arg }: { arg: CreateBudgetRequest }): Promise<BudgetResponse> => {
      // Create the budget on server first
      const newBudget = await budgetService.createBudget(arg);
      
      // Then update the cache with the real data
      await globalMutate(
        async (currentBudgets: BudgetResponse[] | undefined) => {
          return (currentBudgets || []).concat(newBudget);
        },
        {
          revalidate: false,
        }
      );

      return newBudget;
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
    async (_, { arg }: { arg: UpdateBudgetRequest }): Promise<BudgetResponse> => {
      // Update the budget on server first
      const updatedBudget = await budgetService.updateBudget(budgetId, arg);
      
      // Then update the cache with the real data
      await listMutate(
        async (currentBudgets: BudgetResponse[] | undefined) => {
          return (currentBudgets || []).map((b: BudgetResponse) =>
            b.id === budgetId ? updatedBudget : b
          );
        },
        {
          revalidate: false,
        }
      );

      // Also update detail cache if exists
      if (detailMutate) {
        await detailMutate();
      }

      return updatedBudget;
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