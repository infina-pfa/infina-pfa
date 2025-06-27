import { useState, useCallback } from 'react';
import { budgetService } from '@/lib/services/budget.service';
import { CreateBudgetRequest, Budget } from '@/lib/types/budget.types';
import { handleError } from '@/lib/error-handler';
import { useToast } from '@/hooks/use-toast';

export const useBudgetCreate = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  const createBudget = useCallback(async (data: CreateBudgetRequest): Promise<Budget | null> => {
    try {
      setIsCreating(true);
      setError(null);
      
      const newBudget = await budgetService.create(data);
      success('Budget created successfully', `Created "${newBudget.name}" budget`);
      return newBudget;
    } catch (err) {
      const appError = handleError(err);
      setError(appError.message);
      showError('Failed to create budget', appError.message);
      console.error('Budget creation error:', appError);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [success, showError]);

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