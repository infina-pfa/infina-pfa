import { useState } from "react";
import { mutate } from "swr";
import { incomeService } from "@/lib/services/income.service";
import { useAppTranslation } from "@/hooks/use-translation";
import type { CreateIncomeRequest, Income } from "@/lib/types/income.types";

interface UseIncomeCreateSWRReturn {
  createIncome: (data: CreateIncomeRequest) => Promise<Income | null>;
  isCreating: boolean;
  error: string | null;
}

export function useIncomeCreateSWR(): UseIncomeCreateSWRReturn {
  const { t } = useAppTranslation(["income", "common"]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createIncome = async (
    data: CreateIncomeRequest
  ): Promise<Income | null> => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await incomeService.create(data, t);

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
        err instanceof Error ? err.message : "Failed to create income";
      setError(errorMessage);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createIncome,
    isCreating,
    error,
  };
}
