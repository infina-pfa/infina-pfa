import useSWR from "swr";
import { budgetService } from "@/lib/services-v2/budget.service";
import { useAppTranslation } from "@/hooks/use-translation";
import type {
  BudgetFilters,
  BudgetWithSpending,
} from "@/lib/types/budget.types";

interface UseBudgetListSWRReturn {
  budgets: BudgetWithSpending[];
  totalBudget: number;
  totalSpent: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBudgetListSWR(
  filters?: BudgetFilters
): UseBudgetListSWRReturn {
  const { t } = useAppTranslation(["budgeting", "common"]);

  const { data, error, isLoading, mutate } = useSWR(
    ["budgets", filters],
    async () => {
      const response = await budgetService.getAllWithSpending(filters, t);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    {
      // Custom config for budget data
      revalidateOnFocus: true, // Revalidate budgets when user focuses window
      dedupingInterval: 5000, // Budget data can be cached for 5 seconds
    }
  );

  return {
    budgets: data?.budgets || [],
    totalBudget: data?.totalBudget || 0,
    totalSpent: data?.totalSpent || 0,
    loading: isLoading,
    error: error?.message || null,
    refetch: async () => {
      await mutate();
    },
  };
}
