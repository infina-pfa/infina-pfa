import { useState, useCallback } from 'react';
import { budgetService } from '@/lib/services/budget.service';
import { UpdateBudgetRequest, Budget } from '@/lib/types/budget.types';
import { handleError } from '@/lib/error-handler';
import { useToast } from '@/components/ui/toast';

export const useBudgetUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  const updateBudget = useCallback(async (id: string, data: UpdateBudgetRequest): Promise<Budget | null> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const updatedBudget = await budgetService.update(id, data);
      success('Budget updated successfully', `Updated "${updatedBudget.name}" budget`);
      return updatedBudget;
    } catch (err) {
      const appError = handleError(err);
      setError(appError.message);
      showError('Failed to update budget', appError.message);
      console.error('Budget update error:', appError);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [success, showError]);

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