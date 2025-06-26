import { useState, useCallback } from 'react';
import { budgetService } from '@/lib/services/budget.service';
import { UpdateBudgetRequest, Budget } from '@/lib/types/budget.types';
import { handleError } from '@/lib/error-handler';

export const useBudgetUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBudget = useCallback(async (id: string, data: UpdateBudgetRequest): Promise<Budget | null> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const updatedBudget = await budgetService.update(id, data);
      return updatedBudget;
    } catch (err) {
      const appError = handleError(err);
      setError(appError.message);
      console.error('Budget update error:', appError);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    updateBudget,
    isUpdating,
    error,
    clearError
  };
}; 