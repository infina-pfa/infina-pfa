import { useState, useEffect, useCallback } from "react";
import { budgetService } from "@/lib/services-v2/budget.service";
import { UseBudgetDetailReturn, Budget } from "@/lib/types/budget.types";
import { useTranslation } from "react-i18next";

export const useBudgetDetail = (id: string): UseBudgetDetailReturn => {
  const { t } = useTranslation();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudget = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await budgetService.getById(id, t);

      if (response.error) {
        setError(response.error);
        setBudget(null);
      } else {
        setBudget(response.budget);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.unknownError"));
      setBudget(null);
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const refetch = useCallback(async () => {
    await fetchBudget();
  }, [fetchBudget]);

  return {
    budget,
    loading,
    error,
    refetch,
  };
};
