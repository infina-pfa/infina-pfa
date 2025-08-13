import { useState } from "react";
import { mutate } from "swr";
import { incomeService } from "@/lib/services-v2/income.service";
import { useAppTranslation } from "@/hooks/use-translation";

interface UseIncomeDeleteSWRReturn {
  deleteIncome: (id: string) => Promise<boolean>;
  isDeleting: boolean;
  error: string | null;
}

export function useIncomeDeleteSWR(): UseIncomeDeleteSWRReturn {
  const { t } = useAppTranslation(["income", "common"]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteIncome = async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await incomeService.delete(id, t);

      if (response.error) {
        setError(response.error);
        return false;
      }

      // Invalidate income caches to trigger refetch
      await mutate(
        (key) => Array.isArray(key) && key[0] === "incomes",
        undefined,
        { revalidate: true }
      );

      return response.success;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete income";
      setError(errorMessage);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteIncome,
    isDeleting,
    error,
  };
}
