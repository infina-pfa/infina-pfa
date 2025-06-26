import { useState, useEffect, useCallback } from 'react';
import { expenseService } from '@/lib/services/expense.service';
import { handleError } from '@/lib/error-handler';
import { Expense } from '@/lib/types/expense.types';

export const useExpense = (id?: string) => {
  const [expense, setExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpense = useCallback(async (expenseId?: string) => {
    const targetId = expenseId || id;
    
    if (!targetId) {
      setExpense(null);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await expenseService.getById(targetId);
      setExpense(result);
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
      setExpense(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const refreshExpense = useCallback(() => {
    fetchExpense();
  }, [fetchExpense]);

  useEffect(() => {
    if (id) {
      fetchExpense();
    }
  }, [fetchExpense, id]);

  return {
    expense,
    isLoading,
    error,
    refreshExpense,
    fetchExpense,
  };
}; 