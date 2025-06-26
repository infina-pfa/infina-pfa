import { useState } from "react";
import { incomeService } from "@/lib/services/income.service";
import { handleError } from "@/lib/error-handler";
import { Income, UpdateIncomeRequest } from "@/lib/types/income.types";

export const useIncomeUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateIncome = async (
    id: string,
    data: UpdateIncomeRequest
  ): Promise<Income | null> => {
    try {
      setIsUpdating(true);
      setError(null);

      const income = await incomeService.update(id, data);
      return income;
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  const clearError = () => setError(null);

  return {
    updateIncome,
    isUpdating,
    error,
    clearError,
  };
}; 