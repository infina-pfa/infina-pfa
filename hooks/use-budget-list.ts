import { useState, useEffect, useCallback } from 'react';
import { budgetService } from '@/lib/services/budget.service';
import { UseBudgetListReturn, BudgetFilters, Budget } from '@/lib/types/budget.types';
import { useTranslation } from 'react-i18next';

export const useBudgetList = (filters?: BudgetFilters): UseBudgetListReturn => {
  const { t } = useTranslation(['budgeting', 'common']);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await budgetService.getAll(filters, t);
      
      if (response.error) {
        setError(response.error);
        setBudgets([]);
      } else {
        setBudgets(response.budgets);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unknownError', { ns: 'common' }));
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, [filters, t]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const refetch = useCallback(async () => {
    await fetchBudgets();
  }, [fetchBudgets]);

  return {
    budgets,
    loading,
    error,
    refetch,
  };
}; 