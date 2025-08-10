import { useState, useCallback } from "react";
import { budgetService } from "@/lib/services-v2/budget.service";
import {
  UseBudgetUpdateReturn,
  UpdateBudgetRequest,
  Budget,
} from "@/lib/types/budget.types";
import { useTranslation } from "react-i18next";

export const useBudgetUpdate = (): UseBudgetUpdateReturn => {
  const { t } = useTranslation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBudget = useCallback(
    async (id: string, data: UpdateBudgetRequest): Promise<Budget | null> => {
      try {
        setIsUpdating(true);
        setError(null);

        const response = await budgetService.update(id, data, t);

        if (response.error) {
          setError(response.error);
          return null;
        }

        return response.budget;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : t("errors.unknownError");
        setError(errorMessage);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [t]
  );

  return {
    updateBudget,
    isUpdating,
    error,
  };
};
