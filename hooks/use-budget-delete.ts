import { useState, useCallback } from "react";
import { budgetService } from "@/lib/services-v2/budget.service";
import { UseBudgetDeleteReturn } from "@/lib/types/budget.types";
import { useTranslation } from "react-i18next";

export const useBudgetDelete = (): UseBudgetDeleteReturn => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteBudget = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setIsDeleting(true);
        setError(null);

        const response = await budgetService.delete(id, t);

        if (response.error) {
          setError(response.error);
          return false;
        }

        return response.success;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : t("errors.unknownError");
        setError(errorMessage);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [t]
  );

  return {
    deleteBudget,
    isDeleting,
    error,
  };
};
