import useSWR from "swr";
import { goalService } from "@/lib/services-v2/goal.service";
import { useAppTranslation } from "@/hooks/use-translation";
import type {
  GoalIncomeTransactionFilters,
  GoalIncomeTransaction,
  GoalIncomeTransactionsSummary,
} from "@/lib/types/goal.types";

interface UseGoalIncomeTransactionsSWRReturn {
  transactions: GoalIncomeTransaction[];
  summary: GoalIncomeTransactionsSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGoalIncomeTransactionsSWR(
  filters: GoalIncomeTransactionFilters
): UseGoalIncomeTransactionsSWRReturn {
  const { t } = useAppTranslation(["common", "goals"]);

  const { data, error, isLoading, mutate } = useSWR(
    ["goal-income-transactions", filters.month, filters.year, filters.goalId],
    async () => {
      const response = await goalService.getGoalIncomeTransactions(filters, t);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    {
      // Custom config for goal income transactions
      revalidateOnFocus: false, // Don't revalidate on focus for historical data
      dedupingInterval: 30000, // Cache for 30 seconds since data doesn't change often
      revalidateOnMount: true, // Always fetch when component mounts
    }
  );

  return {
    transactions: data?.data?.transactions || [],
    summary: data?.data?.summary || null,
    loading: isLoading,
    error: error?.message || null,
    refetch: async () => {
      await mutate();
    },
  };
}
