import { useState } from "react";
import { mutate } from "swr";
import { goalService } from "@/lib/services-v2/goal.service";
import { useAppTranslation } from "@/hooks/use-translation";
import type {
  CreateGoalTransactionWithdrawalRequest,
  CreateGoalTransactionWithdrawalResponse,
} from "@/lib/types/goal.types";

interface UseGoalTransactionWithdrawalCreateReturn {
  createGoalTransactionWithdrawal: (
    data: CreateGoalTransactionWithdrawalRequest
  ) => Promise<CreateGoalTransactionWithdrawalResponse>;
  isCreating: boolean;
  error: string | null;
}

export function useGoalTransactionWithdrawalCreateSWR(): UseGoalTransactionWithdrawalCreateReturn {
  const { t } = useAppTranslation(["common", "goals"]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGoalTransactionWithdrawal = async (
    data: CreateGoalTransactionWithdrawalRequest
  ): Promise<CreateGoalTransactionWithdrawalResponse> => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await goalService.createGoalTransactionWithdrawal(
        data,
        t
      );

      if (response.success && response.data) {
        // Invalidate related cache keys to refresh data
        await Promise.all([
          mutate(["goals", data.goalId]), // Specific goal data
          mutate(
            (key) => Array.isArray(key) && key[0] === "goals" && key.length >= 1
          ), // All goal-related cache keys
          mutate(["transactions"]), // Transaction list if exists
          mutate(["financial-overview"]), // Financial overview data
        ]);

        return response;
      }

      throw new Error(
        response.error || "Failed to create goal transaction withdrawal"
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create goal transaction withdrawal";
      setError(errorMessage);

      return {
        success: false,
        data: undefined,
        error: errorMessage,
      };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createGoalTransactionWithdrawal,
    isCreating,
    error,
  };
}
