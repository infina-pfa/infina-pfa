import useSWR from 'swr';
import { budgetService } from '@/lib/services/budget.service';
import { useAppTranslation } from '@/hooks/use-translation';

interface UseRecentTransactionsSWRReturn {
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

export function useRecentTransactionsSWR(limit: number = 10): UseRecentTransactionsSWRReturn {
  const { t } = useAppTranslation(['budgeting', 'common']);
  
  const { data, error, isLoading, mutate } = useSWR(
    ['transactions', limit],
    async () => {
      const response = await budgetService.getRecentTransactions(limit, t);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    {
      // Custom config for transaction data
      refreshInterval: 30000, // Auto-refresh transactions every 30 seconds
      dedupingInterval: 3000, // Transaction data can be cached for 3 seconds
    }
  );

  return {
    transactions: data?.transactions || [],
    loading: isLoading,
    error: error?.message || null,
    refetch: async () => { await mutate(); },
  };
} 