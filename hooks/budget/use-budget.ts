import { useState, useEffect, useCallback } from 'react';
import { budgetService } from '@/lib/services/budget.service';
import { Budget } from '@/lib/types/budget.types';
import { handleError } from '@/lib/error-handler';

export const useBudget = (id: string) => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudget = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await budgetService.getById(id);
      setBudget(data);
    } catch (err) {
      const appError = handleError(err);
      setError(appError.message);
      console.error('Budget fetch error:', appError);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    budget,
    loading,
    error,
    refresh: fetchBudget,
    clearError
  };
}; 