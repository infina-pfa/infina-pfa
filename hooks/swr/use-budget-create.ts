import { useState } from "react";
import { mutate } from "swr";
import { budgetService } from "@/lib/services/budget.service";
import { useAppTranslation } from "@/hooks/use-translation";
import type { CreateBudgetRequest, Budget } from "@/lib/types/budget.types";

interface UseBudgetCreateSWRReturn {
  createBudget: (data: CreateBudgetRequest) => Promise<Budget | null>;
  isCreating: boolean;
  error: string | null;
}

interface UseBudgetCreateSWRProps {
  onSuccess?: (budget: Budget) => Promise<void> | void;
}

export function useBudgetCreateSWR({
  onSuccess,
}: UseBudgetCreateSWRProps = {}): UseBudgetCreateSWRReturn {
  const { t } = useAppTranslation(["budgeting", "common"]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBudget = async (
    data: CreateBudgetRequest
  ): Promise<Budget | null> => {
    try {
      setIsCreating(true);
      setError(null);

      // Call existing service
      const response = await budgetService.create(data, t);

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
            onSuccess(response.budget);
          } catch (callbackError) {
            console.error("Budget creation callback failed:", callbackError);
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
      setIsCreating(false);
    }
  };

  return {
    createBudget,
    isCreating,
    error,
  };
}
