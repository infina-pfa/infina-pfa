import { useState, useEffect, useCallback } from "react";
import { incomeService } from "@/lib/services/income.service";
import { handleError } from "@/lib/error-handler";
import { Income, GetIncomesQuery } from "@/lib/types/income.types";

export const useIncomeList = (query?: GetIncomesQuery) => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIncomes = useCallback(
    async (searchQuery?: GetIncomesQuery) => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await incomeService.getAll(searchQuery || query);
        setIncomes(result);
      } catch (error) {
        const appError = handleError(error);
        setError(appError.message);
        setIncomes([]);
      } finally {
        setIsLoading(false);
      }
    },
    [query]
  );

  const refreshIncomes = useCallback(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  return {
    incomes,
    isLoading,
    error,
    refreshIncomes,
    fetchIncomes,
  };
}; 