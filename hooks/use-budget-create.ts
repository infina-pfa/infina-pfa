import { useState, useCallback } from 'react';
import { budgetService } from '@/lib/services/budget.service';
import { UseBudgetCreateReturn, CreateBudgetRequest, Budget } from '@/lib/types/budget.types';
import { useTranslation } from 'react-i18next';

export const useBudgetCreate = (): UseBudgetCreateReturn => {
  const { t } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBudget = useCallback(async (data: CreateBudgetRequest): Promise<Budget | null> => {
    try {
      setIsCreating(true);
      setError(null);
      
      const response = await budgetService.create(data, t);
      
      if (response.error) {
        setError(response.error);
        return null;
      }
      
      return response.budget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errors.unknownError');
      setError(errorMessage);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [t]);

  return {
    createBudget,
    isCreating,
    error,
  };
}; 