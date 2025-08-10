import useSWR from "swr";
import {
  userContextService,
  FinancialOverview,
} from "@/lib/services-v2/user-context.service";
import { useAppTranslation } from "@/hooks/use-translation";

interface UseFinancialOverviewSWRProps {
  month?: number;
  year?: number;
}

interface UseFinancialOverviewSWRReturn {
  overview: FinancialOverview | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFinancialOverviewSWR = ({
  month,
  year,
}: UseFinancialOverviewSWRProps = {}): UseFinancialOverviewSWRReturn => {
  const { t } = useAppTranslation(["common"]);

  // Generate a cache key based on month and year
  const cacheKey =
    month && year
      ? ["financial-overview", month, year]
      : ["financial-overview"];

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    async () => {
      const result = await userContextService.getFinancialOverview(
        month,
        year,
        t
      );

      if (result.error) {
        throw new Error(result.error);
      }

      return result.overview;
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  const refetch = async (): Promise<void> => {
    await mutate();
  };

  return {
    overview: data || null,
    loading: isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : String(error)
      : null,
    refetch,
  };
};
