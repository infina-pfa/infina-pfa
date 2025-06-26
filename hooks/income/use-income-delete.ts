import { useState } from "react";
import { incomeService } from "@/lib/services/income.service";
import { handleError } from "@/lib/error-handler";

export const useIncomeDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteIncome = async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);

      await incomeService.delete(id);
      return true;
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const clearError = () => setError(null);

  return {
    deleteIncome,
    isDeleting,
    error,
    clearError,
  };
}; 