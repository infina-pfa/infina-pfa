import { useState, useCallback } from 'react';
import { budgetService } from '@/lib/services/budget.service';
import { handleError } from '@/lib/error-handler';

export const useBudgetDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteBudget = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);
      
      await budgetService.delete(id);
      return true;
    } catch (err) {
      const appError = handleError(err);
      setError(appError.message);
      console.error('Budget deletion error:', appError);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    deleteBudget,
    isDeleting,
    error,
    clearError
  };
}; 