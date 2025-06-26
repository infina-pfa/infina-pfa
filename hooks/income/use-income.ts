import { useState, useEffect, useCallback } from "react";
import { incomeService } from "@/lib/services/income.service";
import { handleError } from "@/lib/error-handler";
import { Income } from "@/lib/types/income.types";

export const useIncome = (id?: string) => {
  const [income, setIncome] = useState<Income | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIncome = useCallback(
    async (incomeId?: string) => {
      const targetId = incomeId || id;

      if (!targetId) {
        setIncome(null);
        setError(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const result = await incomeService.getById(targetId);
        setIncome(result);
      } catch (error) {
        const appError = handleError(error);
        setError(appError.message);
        setIncome(null);
      } finally {
        setIsLoading(false);
      }
    },
    [id]
  );

  const refreshIncome = useCallback(() => {
    fetchIncome();
  }, [fetchIncome]);

  useEffect(() => {
    if (id) {
      fetchIncome();
    }
  }, [fetchIncome, id]);

  return {
    income,
    isLoading,
    error,
    refreshIncome,
    fetchIncome,
  };
}; 