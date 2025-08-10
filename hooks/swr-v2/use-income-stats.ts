import useSWR from "swr";
import { incomeService } from "@/lib/services-v2/income.service";
import { useAppTranslation } from "@/hooks/use-translation";
import type { IncomeStats } from "@/lib/types/income.types";

interface UseIncomeStatsSWRReturn {
  stats: IncomeStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useIncomeStatsSWR(filters?: {
  month?: number;
  year?: number;
}): UseIncomeStatsSWRReturn {
  const { t } = useAppTranslation(["income", "common"]);

  const { data, error, isLoading, mutate } = useSWR(
    ["incomes", "stats", filters],
    async () => {
      const response = await incomeService.getStats(filters, t);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    {
      // Custom config for stats data
      revalidateOnFocus: false, // Stats don't need to revalidate on focus
      dedupingInterval: 10000, // Stats can be cached longer (10 seconds)
    }
  );

  return {
    stats: data?.stats || null,
    loading: isLoading,
    error: error?.message || null,
    refetch: async () => {
      await mutate();
    },
  };
}
