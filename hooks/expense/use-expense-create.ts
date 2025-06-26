import { useState } from 'react';
import { expenseService } from '@/lib/services/expense.service';
import { handleError } from '@/lib/error-handler';
import { Expense, CreateExpenseRequest } from '@/lib/types/expense.types';

export const useExpenseCreate = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createExpense = async (data: CreateExpenseRequest): Promise<Expense | null> => {
    try {
      setIsCreating(true);
      setError(null);
      
      const expense = await expenseService.create(data);
      return expense;
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const clearError = () => setError(null);

  return {
    createExpense,
    isCreating,
    error,
    clearError,
  };
}; 