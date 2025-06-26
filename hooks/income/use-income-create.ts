import { useState } from "react";
import { incomeService } from "@/lib/services/income.service";
import { handleError } from "@/lib/error-handler";
import { Income, CreateIncomeRequest } from "@/lib/types/income.types";

export const useIncomeCreate = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createIncome = async (
    data: CreateIncomeRequest
  ): Promise<Income | null> => {
    try {
      setIsCreating(true);
      setError(null);

      const income = await incomeService.create(data);
      return income;
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const clearError = () => setError(null);

  return {
    createIncome,
    isCreating,
    error,
    clearError,
  };
}; 