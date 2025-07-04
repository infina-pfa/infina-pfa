import { useState } from 'react';
import { mutate } from 'swr';
import { transactionService } from '@/lib/services/transaction.service';
import { useAppTranslation } from '@/hooks/use-translation';
import type { UpdateExpenseRequest, Transaction } from '@/lib/types/transaction.types';

interface UseExpenseUpdateSWRReturn {
  updateExpense: (id: string, data: UpdateExpenseRequest) => Promise<Transaction | null>;
  isUpdating: boolean;
  error: string | null;
}

export function useExpenseUpdateSWR(): UseExpenseUpdateSWRReturn {
  const { t } = useAppTranslation(['budgeting', 'common']);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateExpense = async (id: string, data: UpdateExpenseRequest): Promise<Transaction | null> => {
    try {
      setIsUpdating(true);
      setError(null);

      // Call existing service
      const response = await transactionService.updateExpense(id, data, t);

      if (response.error) {
        setError(response.error);
        return null;
      }

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
          key => Array.isArray(key) && key[0].startsWith('transactions'),
          undefined,
          { revalidate: true }
        ),
      ]);

      return response.transaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('unknownError', { ns: 'common' });
      setError(errorMessage);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateExpense,
    isUpdating,
    error,
  };
} 