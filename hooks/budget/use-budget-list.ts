import { useState, useEffect, useCallback } from 'react';
import { budgetService } from '@/lib/services/budget.service';
import { Budget, GetBudgetsQuery } from '@/lib/types/budget.types';
import { handleError } from '@/lib/error-handler';

export const useBudgetList = (query?: GetBudgetsQuery) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await budgetService.getAll(query);
      setBudgets(data);
    } catch (err) {
      const appError = handleError(err);
      setError(appError.message);
      console.error('Budget list error:', appError);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // Methods to update local state (called by other hooks)
  const addBudget = useCallback((budget: Budget) => {
    setBudgets(prev => [budget, ...prev]);
  }, []);

  const updateBudget = useCallback((updatedBudget: Budget) => {
    setBudgets(prev => 
      prev.map(budget => 
        budget.id === updatedBudget.id ? updatedBudget : budget
      )
    );
  }, []);

  const removeBudget = useCallback((budgetId: string) => {
    setBudgets(prev => prev.filter(budget => budget.id !== budgetId));
  }, []);

  return {
    budgets,
    loading,
    error,
    refresh: fetchBudgets,
    // Local state updaters
    addBudget,
    updateBudget,
    removeBudget
  };
}; 