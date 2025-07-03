import { useState } from 'react';
import { mutate } from 'swr';
import { transactionService } from '@/lib/services/transaction.service';
import { useAppTranslation } from '@/hooks/use-translation';
import type { CreateExpenseRequest, Transaction, BudgetTransaction } from '@/lib/types/transaction.types';

interface UseExpenseCreateSWRReturn {
  createExpense: (data: CreateExpenseRequest) => Promise<{ transaction: Transaction; budgetTransaction: BudgetTransaction } | null>;
  isCreating: boolean;
  error: string | null;
}

export function useExpenseCreateSWR(): UseExpenseCreateSWRReturn {
  const { t } = useAppTranslation(['budgeting', 'common']);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createExpense = async (data: CreateExpenseRequest) => {
    try {
      setIsCreating(true);
      setError(null);

      // Call existing service
      const response = await transactionService.createExpense(data, t);

      if (response.error) {
        setError(response.error);
        return null;
      }

      if (response.transaction && response.budgetTransaction) {
        // ✨ SWR Magic: Invalidate all related data automatically
        await Promise.all([
          // Invalidate all budget queries (will trigger re-fetch for budget components)
          mutate(
            key => Array.isArray(key) && key[0] === 'budgets',
            undefined,
            { revalidate: true }
          ),
          // Invalidate all transaction queries (will trigger re-fetch for transaction components)
          mutate(
            key => Array.isArray(key) && key[0] === 'transactions',
            undefined,
            { revalidate: true }
          ),
        ]);

        return {
          transaction: response.transaction,
          budgetTransaction: response.budgetTransaction,
        };
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('unknownError', { ns: 'common' });
      setError(errorMessage);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createExpense,
    isCreating,
    error,
  };
} 