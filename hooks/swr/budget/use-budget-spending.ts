"use client";

import useSWR, { mutate as globalMutate } from "swr";
import useSWRMutation from "swr/mutation";
import { budgetService } from "@/lib/services/budget.service";
import {
  SpendRequest,
  TransactionResponse,
  BudgetDetailResponse,
} from "@/lib/types/budget.types";

/**
 * Hook for fetching monthly spending transactions
 */
export function useMonthlySpending(month: number, year: number) {
  const { data, error, isLoading, mutate } = useSWR(
    ["spending", month, year],
    () => budgetService.getMonthlySpending(month, year),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    transactions: data as TransactionResponse[] | undefined,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook for recording spending with optimistic updates
 */
export function useRecordSpending(
  budgetId: string,
  month: number,
  year: number
) {
  const { trigger, isMutating, error } = useSWRMutation(
    ["spending", "record", budgetId],
    async (_, { arg }: { arg: SpendRequest }) => {
      // Create optimistic transaction
      const tempTransaction: Partial<TransactionResponse> = {
        id: `temp-${Date.now()}`,
        name: arg.name || "Expense",
        description: arg.description || "",
        amount: arg.amount,
        recurring: arg.recurring || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically update budget detail (increase spent amount)
      await globalMutate(
        ["budget", budgetId],
        async () => {
          try {
            const updatedBudget = await budgetService.recordSpending(
              budgetId,
              arg
            );
            return updatedBudget;
          } catch (error) {
            throw error;
          }
        },
        {
          optimisticData: (current: BudgetDetailResponse | undefined) => {
            if (!current) return current;
            return {
              ...current,
              spent: current.spent + arg.amount,
              transactions: [
                ...(current.transactions || []),
                tempTransaction as TransactionResponse,
              ],
            };
          },
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        }
      );

      // Also revalidate budget list and monthly spending
      await Promise.all([
        globalMutate(["budgets", month, year]),
        globalMutate(["spending", month, year]),
      ]);

      return true;
    }
  );

  return {
    recordSpending: trigger,
    isRecording: isMutating,
    error,
  };
}

/**
 * Hook for deleting spending with optimistic updates
 */
export function useDeleteSpending(
  budgetId: string,
  month: number,
  year: number
) {
  const { trigger, isMutating, error } = useSWRMutation(
    ["spending", "delete", budgetId],
    async (_, { arg }: { arg: { spendingId: string; amount: number } }) => {
      const { spendingId, amount } = arg;

      // Optimistically update budget detail (decrease spent amount)
      await globalMutate(
        ["budget", budgetId],
        async (currentBudget: BudgetDetailResponse) => {
          const optimisticBudget: BudgetDetailResponse = {
            ...currentBudget,
            spent: Math.max(0, currentBudget.spent - amount),
            transactions: currentBudget.transactions.filter(
              (t) => t.id !== spendingId
            ),
          };

          try {
            await budgetService.deleteSpending(budgetId, spendingId);
            // Return optimistic data as final data
            return optimisticBudget;
          } catch (error) {
            throw error;
          }
        },
        {
          optimisticData: (current: BudgetDetailResponse | undefined) => {
            if (!current) return current;
            return {
              ...current,
              spent: Math.max(0, current.spent - amount),
              transactions: current.transactions.filter(
                (t) => t.id !== spendingId
              ),
            };
          },
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        }
      );

      // Also revalidate budget list and monthly spending
      await Promise.all([
        globalMutate(["budgets", month, year]),
        globalMutate(["spending", month, year]),
      ]);

      return true;
    }
  );

  return {
    deleteSpending: trigger,
    isDeleting: isMutating,
    error,
  };
}
