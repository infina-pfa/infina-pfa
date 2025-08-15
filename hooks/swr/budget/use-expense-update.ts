import { useState } from "react";
import { mutate } from "swr";
import { transactionService } from "@/lib/services/transaction.service";
import { UpdateExpenseRequest } from "@/lib/types/transaction.types";
import { handleError } from "@/lib/error-handler";

/**
 * Hook for updating expense transactions
 * Uses the transaction service for update operations
 */
export function useUpdateExpense() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateExpense = async (
    id: string,
    data: UpdateExpenseRequest
  ): Promise<{ id: string; name: string; amount: number; description: string | null } | null> => {
    try {
      setIsUpdating(true);
      setError(null);

      // Call the transaction service to update the expense
      const updatedExpense = await transactionService.updateExpense(id, data);

      // Invalidate all related SWR caches to trigger refetch
      await Promise.all([
        // Invalidate budget queries
        mutate((key) => Array.isArray(key) && key[0] === "budgets", undefined, {
          revalidate: true,
        }),
        // Invalidate spending queries
        mutate((key) => Array.isArray(key) && key[0] === "spending", undefined, {
          revalidate: true,
        }),
        // Invalidate budget detail queries
        mutate((key) => Array.isArray(key) && key[0] === "budget", undefined, {
          revalidate: true,
        }),
      ]);

      return {
        id: updatedExpense.id,
        name: updatedExpense.name,
        amount: updatedExpense.amount,
        description: updatedExpense.description,
      };
    } catch (err) {
      const appError = handleError(err);
      setError(appError.message);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateExpense,
    isUpdating,
    error,
  };
}