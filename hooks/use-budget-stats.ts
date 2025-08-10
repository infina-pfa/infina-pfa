import { useState, useEffect, useCallback } from "react";
import { budgetService } from "@/lib/services-v2/budget.service";
import { BudgetStats } from "@/lib/types/budget.types";
import { useTranslation } from "react-i18next";

export interface UseBudgetStatsReturn {
  stats: BudgetStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useBudgetStats = (): UseBudgetStatsReturn => {
  const { t } = useTranslation(["budgeting", "common"]);
  const [stats, setStats] = useState<BudgetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await budgetService.getStats(t);

      if (response.error) {
        setError(response.error);
        setStats(null);
      } else {
        setStats(response.stats);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("unknownError", { ns: "common" })
      );
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch,
  };
};
