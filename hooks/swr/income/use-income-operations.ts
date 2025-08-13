"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { incomeService } from "@/lib/services/income.service";
import {
  IncomeResponse,
  CreateIncomeRequest,
  UpdateIncomeRequest,
} from "@/lib/types/income.types";

/**
 * Hook for fetching monthly income
 */
export function useMonthlyIncome(month: number, year: number) {
  const { data, error, isLoading, mutate } = useSWR(
    ["income", month, year],
    () => incomeService.getMonthlyIncome(month, year),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    income: data as IncomeResponse[] | undefined,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook for creating income with optimistic updates
 */
export function useCreateIncome(month: number, year: number) {
  const { mutate: globalMutate } = useSWR(["income", month, year]);

  const { trigger, isMutating, error } = useSWRMutation(
    ["income", "create"],
    async (_, { arg }: { arg: CreateIncomeRequest }): Promise<IncomeResponse> => {
      // Create the income on server first
      const newIncome = await incomeService.createIncome(arg);
      
      // Then update the cache with the real data
      await globalMutate(
        async (currentIncome: IncomeResponse[] | undefined) => {
          return (currentIncome || []).concat(newIncome);
        },
        {
          revalidate: false,
        }
      );

      return newIncome;
    }
  );

  return {
    createIncome: trigger,
    isCreating: isMutating,
    error,
  };
}

/**
 * Hook for updating income with optimistic updates
 */
export function useUpdateIncome(incomeId: string, month: number, year: number) {
  const { mutate: listMutate } = useSWR(["income", month, year]);

  const { trigger, isMutating, error } = useSWRMutation(
    ["income", "update", incomeId],
    async (_, { arg }: { arg: UpdateIncomeRequest }): Promise<IncomeResponse> => {
      // Update the income on server first
      const updatedIncome = await incomeService.updateIncome(incomeId, arg);
      
      // Then update the cache with the real data
      await listMutate(
        async (currentIncome: IncomeResponse[] | undefined) => {
          return (currentIncome || []).map((income: IncomeResponse) =>
            income.id === incomeId ? updatedIncome : income
          );
        },
        {
          revalidate: false,
        }
      );

      return updatedIncome;
    }
  );

  return {
    updateIncome: trigger,
    isUpdating: isMutating,
    error,
  };
}

/**
 * Hook for deleting income with optimistic updates
 */
export function useDeleteIncome(month: number, year: number) {
  const { mutate: globalMutate } = useSWR(["income", month, year]);

  const { trigger, isMutating, error } = useSWRMutation(
    ["income", "delete"],
    async (_, { arg: incomeId }: { arg: string }) => {
      // Optimistic update - remove income from list
      await globalMutate(
        async (currentIncome: IncomeResponse[] | undefined) => {
          const optimisticIncome = (currentIncome || []).filter(
            (income: IncomeResponse) => income.id !== incomeId
          );

          try {
            await incomeService.deleteIncome(incomeId);
            return optimisticIncome;
          } catch (error) {
            throw error;
          }
        },
        {
          optimisticData: (current: IncomeResponse[] | undefined) =>
            (current || []).filter((income: IncomeResponse) => income.id !== incomeId),
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        }
      );

      return true;
    }
  );

  return {
    deleteIncome: trigger,
    isDeleting: isMutating,
    error,
  };
}