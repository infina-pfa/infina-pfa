import { useState } from "react";
import { mutate } from "swr";
import { incomeService } from "@/lib/services/income.service";
import { useAppTranslation } from "@/hooks/use-translation";
import type { UpdateIncomeRequest, Income } from "@/lib/types/income.types";

interface UseIncomeUpdateSWRReturn {
  updateIncome: (
    id: string,
    data: UpdateIncomeRequest
  ) => Promise<Income | null>;
  isUpdating: boolean;
  error: string | null;
}

export function useIncomeUpdateSWR(): UseIncomeUpdateSWRReturn {
  const { t } = useAppTranslation(["income", "common"]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateIncome = async (
    id: string,
    data: UpdateIncomeRequest
  ): Promise<Income | null> => {
    try {
      setIsUpdating(true);
      setError(null);

      const response = await incomeService.update(id, data, t);

      if (response.error) {
        setError(response.error);
        return null;
      }

      // Invalidate income caches to trigger refetch
      await mutate(
        (key) => Array.isArray(key) && key[0] === "incomes",
        undefined,
        { revalidate: true }
      );

      return response.income;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update income";
      setError(errorMessage);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateIncome,
    isUpdating,
    error,
  };
}
