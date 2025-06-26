import { useState } from 'react';
import { expenseService } from '@/lib/services/expense.service';
import { handleError } from '@/lib/error-handler';
import { Expense, UpdateExpenseRequest } from '@/lib/types/expense.types';

export const useExpenseUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateExpense = async (id: string, data: UpdateExpenseRequest): Promise<Expense | null> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const expense = await expenseService.update(id, data);
      return expense;
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  const clearError = () => setError(null);

  return {
    updateExpense,
    isUpdating,
    error,
    clearError,
  };
}; 