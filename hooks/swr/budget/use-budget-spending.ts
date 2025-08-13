import { budgetService } from "@/lib/services/budget.service";
import { SpendRequest } from "@/lib/types/budget.types";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

/**
 * Hook for recording spending against a budget
 */
export function useRecordSpending(
  budgetId: string,
  month: number,
  year: number
) {
  const { mutate: budgetMutate } = useSWR(["budgets", month, year]);
  const { mutate: spendingMutate } = useSWR(["spending", month, year]);

  const { trigger, isMutating, error } = useSWRMutation(
    ["budget", budgetId, "spend"],
    async (_, { arg }: { arg: SpendRequest }) => {
      const updatedBudget = await budgetService.recordSpending(budgetId, arg);

      // Invalidate both budget list and spending list caches
      await Promise.all([
        budgetMutate(),
        spendingMutate()
      ]);

      return updatedBudget;
    }
  );

  return {
    recordSpending: trigger,
    isRecording: isMutating,
    error,
  };
}

/**
 * Hook for deleting a spending transaction
 */
export function useDeleteSpending(
  budgetId: string,
  month: number,
  year: number
) {
  const { mutate: budgetMutate } = useSWR(["budgets", month, year]);
  const { mutate: spendingMutate } = useSWR(["spending", month, year]);

  const { trigger, isMutating, error } = useSWRMutation(
    ["budget", budgetId, "spending", "delete"],
    async (_, { arg: spendingId }: { arg: string }) => {
      await budgetService.deleteSpending(budgetId, spendingId);

      // Invalidate both budget list and spending list caches
      await Promise.all([
        budgetMutate(),
        spendingMutate()
      ]);
    }
  );

  return {
    deleteSpending: trigger,
    isDeleting: isMutating,
    error,
  };
}

/**
 * Hook for fetching monthly spending transactions
 */
export function useMonthlySpending(month: number, year: number) {
  const { data, error, isLoading, mutate } = useSWR(
    ["spending", month, year],
    () => budgetService.getMonthlySpending(month, year),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    spending: data || [],
    isLoading,
    isError: error,
    refetch: mutate,
  };
}
