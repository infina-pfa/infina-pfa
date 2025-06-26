import { useState, useEffect, useCallback } from 'react';
import { expenseService } from '@/lib/services/expense.service';
import { handleError } from '@/lib/error-handler';
import { Expense, GetExpensesQuery } from '@/lib/types/expense.types';

export const useExpenseList = (query?: GetExpensesQuery) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async (searchQuery?: GetExpensesQuery) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await expenseService.getAll(searchQuery || query);
      setExpenses(result);
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const refreshExpenses = useCallback(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return {
    expenses,
    isLoading,
    error,
    refreshExpenses,
    fetchExpenses,
  };
}; 