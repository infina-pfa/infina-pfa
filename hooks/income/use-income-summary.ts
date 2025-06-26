import { useState, useEffect, useCallback } from "react";
import { incomeService } from "@/lib/services/income.service";
import { handleError } from "@/lib/error-handler";
import { IncomeSummary, GetIncomesQuery } from "@/lib/types/income.types";

export const useIncomeSummary = (query?: GetIncomesQuery) => {
  const [summary, setSummary] = useState<IncomeSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(
    async (searchQuery?: GetIncomesQuery) => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await incomeService.getSummary(searchQuery || query);
        setSummary(result);
      } catch (error) {
        const appError = handleError(error);
        setError(appError.message);
        setSummary(null);
      } finally {
        setIsLoading(false);
      }
    },
    [query]
  );

  const refreshSummary = useCallback(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    isLoading,
    error,
    refreshSummary,
    fetchSummary,
  };
}; 