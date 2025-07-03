import { useState, useEffect, useCallback } from 'react';
import { budgetService } from '@/lib/services/budget.service';
import { UseBudgetListReturn, BudgetFilters, Budget, BudgetWithSpending } from '@/lib/types/budget.types';
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

export interface UseBudgetListWithSpendingReturn {
  budgets: BudgetWithSpending[];
  totalBudget: number;
  totalSpent: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useBudgetListWithSpending = (filters?: BudgetFilters): UseBudgetListWithSpendingReturn => {
  const { t } = useTranslation(['budgeting', 'common']);
  const [budgets, setBudgets] = useState<BudgetWithSpending[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgetsWithSpending = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await budgetService.getAllWithSpending(filters, t);
      
      if (response.error) {
        setError(response.error);
        setBudgets([]);
        setTotalBudget(0);
        setTotalSpent(0);
      } else {
        setBudgets(response.budgets as BudgetWithSpending[]);
        setTotalBudget(response.totalBudget);
        setTotalSpent(response.totalSpent);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unknownError', { ns: 'common' }));
      setBudgets([]);
      setTotalBudget(0);
      setTotalSpent(0);
    } finally {
      setLoading(false);
    }
  }, [filters, t]);

  useEffect(() => {
    fetchBudgetsWithSpending();
  }, [fetchBudgetsWithSpending]);

  const refetch = useCallback(async () => {
    await fetchBudgetsWithSpending();
  }, [fetchBudgetsWithSpending]);

  return {
    budgets,
    totalBudget,
    totalSpent,
    loading,
    error,
    refetch,
  };
};

export interface UseRecentTransactionsReturn {
  transactions: Array<{
    id: string;
    name: string;
    amount: number;
    date: string;
    category: string;
    type: string;
    description: string | null;
    budgetName?: string;
  }>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRecentTransactions = (limit: number = 10): UseRecentTransactionsReturn => {
  const { t } = useTranslation(['budgeting', 'common']);
  const [transactions, setTransactions] = useState<Array<{
    id: string;
    name: string;
    amount: number;
    date: string;
    category: string;
    type: string;
    description: string | null;
    budgetName?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await budgetService.getRecentTransactions(limit, t);
      
      if (response.error) {
        setError(response.error);
        setTransactions([]);
      } else {
        setTransactions(response.transactions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unknownError', { ns: 'common' }));
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [limit, t]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const refetch = useCallback(async () => {
    await fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    refetch,
  };
}; 