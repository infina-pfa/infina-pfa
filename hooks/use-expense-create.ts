import { useState, useCallback } from "react";
import { transactionService } from "@/lib/services-v2/transaction.service";
import { useAppTranslation } from "@/hooks/use-translation";
import {
  CreateExpenseRequest,
  UseExpenseCreateReturn,
} from "@/lib/types/transaction.types";

export const useExpenseCreate = (): UseExpenseCreateReturn => {
  const { t } = useAppTranslation(["budgeting", "common"]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createExpense = useCallback(
    async (data: CreateExpenseRequest) => {
      try {
        setIsCreating(true);
        setError(null);

        const response = await transactionService.createExpense(data, t);

        if (response.error) {
          setError(response.error);
          return null;
        }

        if (response.transaction && response.budgetTransaction) {
          return {
            transaction: response.transaction,
            budgetTransaction: response.budgetTransaction,
          };
        }

        return null;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : t("unknownError", { ns: "common" });
        setError(errorMessage);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [t]
  );

  return {
    createExpense,
    isCreating,
    error,
  };
};
