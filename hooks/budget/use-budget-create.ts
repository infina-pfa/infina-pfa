import { useState, useCallback } from 'react';
import { budgetService } from '@/lib/services/budget.service';
import { CreateBudgetRequest, Budget } from '@/lib/types/budget.types';
import { handleError } from '@/lib/error-handler';

export const useBudgetCreate = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBudget = useCallback(async (data: CreateBudgetRequest): Promise<Budget | null> => {
    try {
      setIsCreating(true);
      setError(null);
      
      const newBudget = await budgetService.create(data);
      return newBudget;
    } catch (err) {
      const appError = handleError(err);
      setError(appError.message);
      console.error('Budget creation error:', appError);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createBudget,
    isCreating,
    error,
    clearError
  };
}; 