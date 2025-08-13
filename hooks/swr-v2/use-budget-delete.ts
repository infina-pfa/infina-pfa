import { useState } from "react";
import { mutate } from "swr";
import { budgetService } from "@/lib/services-v2/budget.service";
import { useAppTranslation } from "@/hooks/use-translation";

interface UseBudgetDeleteSWRReturn {
  deleteBudget: (id: string) => Promise<boolean>;
  isDeleting: boolean;
  error: string | null;
}

export function useBudgetDeleteSWR(): UseBudgetDeleteSWRReturn {
  const { t } = useAppTranslation(["budgeting", "common"]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteBudget = async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);

      // Call existing service
      const response = await budgetService.delete(id, t);

      if (response.error) {
        setError(response.error);
        return false;
      }

      if (response.success) {
        // ✨ SWR Magic: Invalidate all budget queries to trigger re-fetch
        await Promise.all([
          // Invalidate all budget queries
          mutate(
            (key) => Array.isArray(key) && key[0] === "budgets",
            undefined,
            { revalidate: true }
          ),
          // Invalidate all transaction queries (since deleting a budget affects transactions)
          mutate(
            (key) => Array.isArray(key) && key[0] === "transactions",
            undefined,
            { revalidate: true }
          ),
        ]);

        return true;
      }

      return false;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : t("unknownError", { ns: "common" });
      setError(errorMessage);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteBudget,
    isDeleting,
    error,
  };
}
