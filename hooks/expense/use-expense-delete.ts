import { useState } from 'react';
import { expenseService } from '@/lib/services/expense.service';
import { handleError } from '@/lib/error-handler';

export const useExpenseDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteExpense = async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);
      
      await expenseService.delete(id);
      return true;
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const clearError = () => setError(null);

  return {
    deleteExpense,
    isDeleting,
    error,
    clearError,
  };
}; 