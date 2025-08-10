import { useState } from "react";
import { mutate } from "swr";
import { transactionService } from "@/lib/services-v2/transaction.service";
import { useAppTranslation } from "@/hooks/use-translation";
import type {
  UpdateExpenseRequest,
  Transaction,
} from "@/lib/types/transaction.types";

// Extended transaction type with budget info for callbacks
interface TransactionWithBudgetInfo extends Transaction {
  budgetName?: string;
  budgetColor?: string;
}

interface UseExpenseUpdateSWRReturn {
  updateExpense: (
    id: string,
    data: UpdateExpenseRequest
  ) => Promise<Transaction | null>;
  isUpdating: boolean;
  error: string | null;
}

interface UseExpenseUpdateSWRProps {
  onSuccess?: (expense: TransactionWithBudgetInfo) => Promise<void> | void;
}

export function useExpenseUpdateSWR({
  onSuccess,
}: UseExpenseUpdateSWRProps = {}): UseExpenseUpdateSWRReturn {
  const { t } = useAppTranslation(["budgeting", "common"]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateExpense = async (
    id: string,
    data: UpdateExpenseRequest
  ): Promise<Transaction | null> => {
    try {
      setIsUpdating(true);
      setError(null);

      // Call existing service
      const response = await transactionService.updateExpense(id, data, t);

      if (response.error) {
        setError(response.error);
        return null;
      }

      // ✨ SWR Magic: Invalidate all related data automatically
      await Promise.all([
        // Invalidate all budget queries (will trigger re-fetch for budget components)
        mutate((key) => Array.isArray(key) && key[0] === "budgets", undefined, {
          revalidate: true,
        }),
        // Invalidate all transaction queries (will trigger re-fetch for transaction components)
        mutate(
          (key) => Array.isArray(key) && key[0].startsWith("transactions"),
          undefined,
          { revalidate: true }
        ),
      ]);

      // Call success callback if provided
      if (onSuccess && response.transaction) {
        try {
          // Create transaction with budget info for callback
          const transactionWithBudgetInfo: TransactionWithBudgetInfo = {
            ...response.transaction,
            // We'll need to get budget info from existing data or cache
            // For now, we'll pass the transaction as is
          };
          onSuccess(transactionWithBudgetInfo);
        } catch (callbackError) {
          console.error("Expense update callback failed:", callbackError);
        }
      }

      return response.transaction;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : t("unknownError", { ns: "common" });
      setError(errorMessage);
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
