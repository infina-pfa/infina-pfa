import useSWR from "swr";
import { incomeService } from "@/lib/services-v2/income.service";
import { useAppTranslation } from "@/hooks/use-translation";
import type { IncomeFilters, Income } from "@/lib/types/income.types";

interface UseIncomeListSWRReturn {
  incomes: Income[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useIncomeListSWR(
  filters?: IncomeFilters
): UseIncomeListSWRReturn {
  const { t } = useAppTranslation(["income", "common"]);

  const { data, error, isLoading, mutate } = useSWR(
    ["incomes", filters],
    async () => {
      const response = await incomeService.getAll(filters, t);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    {
      // Custom config for income data
      revalidateOnFocus: true, // Revalidate incomes when user focuses window
      dedupingInterval: 5000, // Income data can be cached for 5 seconds
    }
  );

  return {
    incomes: data?.incomes || [],
    loading: isLoading,
    error: error?.message || null,
    refetch: async () => {
      await mutate();
    },
  };
}
