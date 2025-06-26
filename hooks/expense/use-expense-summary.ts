import { useState, useEffect, useCallback } from 'react';
import { expenseService } from '@/lib/services/expense.service';
import { handleError } from '@/lib/error-handler';
import { ExpenseSummary, GetExpensesQuery } from '@/lib/types/expense.types';

export const useExpenseSummary = (query?: GetExpensesQuery) => {
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async (searchQuery?: GetExpensesQuery) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await expenseService.getSummary(searchQuery || query);
      setSummary(result);
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

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