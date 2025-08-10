import useSWR from "swr";
import { goalService } from "@/lib/services-v2/goal.service";
import { useAppTranslation } from "@/hooks/use-translation";
import type { GoalFilters, Goal } from "@/lib/types/goal.types";

interface UseGoalListSWRReturn {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGoalListSWR(filters?: GoalFilters): UseGoalListSWRReturn {
  const { t } = useAppTranslation(["common"]);

  const { data, error, isLoading, mutate } = useSWR(
    ["goals", filters],
    async () => {
      const response = await goalService.getAllWithTransactions(filters, t);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    {
      // Custom config for goal data
      revalidateOnFocus: true, // Revalidate goals when user focuses window
      dedupingInterval: 5000, // Goal data can be cached for 5 seconds
    }
  );

  return {
    goals: data?.goals || [],
    loading: isLoading,
    error: error?.message || null,
    refetch: async () => {
      await mutate();
    },
  };
}
