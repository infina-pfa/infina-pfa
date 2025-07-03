import { useState, useCallback } from "react";
import { transactionService } from "@/lib/services/transaction.service";
import { useAppTranslation } from "@/hooks/use-translation";
import { UpdateExpenseRequest, UseExpenseUpdateReturn } from "@/lib/types/transaction.types";

export const useExpenseUpdate = (): UseExpenseUpdateReturn => {
  const { t } = useAppTranslation(["budgeting", "common"]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateExpense = useCallback(async (id: string, data: UpdateExpenseRequest) => {
    try {
      setIsUpdating(true);
      setError(null);

      const response = await transactionService.updateExpense(id, data, t);

      if (response.error) {
        setError(response.error);
        return null;
      }

      return response.transaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('unknownError', { ns: 'common' });
      setError(errorMessage);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [t]);

  return {
    updateExpense,
    isUpdating,
    error,
  };
}; 