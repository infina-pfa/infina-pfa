import { useState } from "react";
import { mutate } from "swr";
import { budgetService } from "@/lib/services-v2/budget.service";
import { useAppTranslation } from "@/hooks/use-translation";
import type { UpdateBudgetRequest, Budget } from "@/lib/types/budget.types";

interface UseBudgetUpdateSWRReturn {
  updateBudget: (
    id: string,
    data: UpdateBudgetRequest,
    oldAmount?: number
  ) => Promise<Budget | null>;
  isUpdating: boolean;
  error: string | null;
}

interface UseBudgetUpdateSWRProps {
  onSuccess?: (budget: Budget, oldAmount?: number) => Promise<void> | void;
}

export function useBudgetUpdateSWR({
  onSuccess,
}: UseBudgetUpdateSWRProps = {}): UseBudgetUpdateSWRReturn {
  const { t } = useAppTranslation(["budgeting", "common"]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBudget = async (
    id: string,
    data: UpdateBudgetRequest,
    oldAmount?: number
  ): Promise<Budget | null> => {
    try {
      setIsUpdating(true);
      setError(null);

      // Call existing service
      const response = await budgetService.update(id, data, t);

      if (response.error) {
        setError(response.error);
        return null;
      }

      if (response.budget) {
        // ✨ SWR Magic: Invalidate all budget queries to trigger re-fetch
        await mutate(
          (key) => Array.isArray(key) && key[0] === "budgets",
          undefined,
          { revalidate: true }
        );

        // Call success callback if provided
        if (onSuccess) {
          try {
            onSuccess(response.budget, oldAmount);
          } catch (callbackError) {
            console.error("Budget update callback failed:", callbackError);
          }
        }

        return response.budget;
      }

      return null;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : t("unknownError", { ns: "common" });
      setError(errorMessage);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateBudget,
    isUpdating,
    error,
  };
}
