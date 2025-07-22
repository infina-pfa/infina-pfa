import { useState } from "react";
import { mutate } from "swr";
import { apiClient } from "@/lib/api-client";

interface WithdrawRequest {
  name: string;
  amount: number;
  description?: string;
  date?: string;
}

interface WithdrawResponse {
  success: boolean;
  data: {
    transaction: {
      id: string;
      name: string;
      amount: number;
      description: string | null;
      type: string;
      created_at: string;
    };
    goalTransaction: {
      id: string;
      goal_id: string;
      transaction_id: string;
    };
    updatedCurrentAmount: number;
    goal: {
      id: string;
      title: string;
      currentAmount: number;
    };
  };
}

export const useGoalWithdraw = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withdraw = async (
    goalId: string,
    data: WithdrawRequest
  ): Promise<WithdrawResponse["data"] | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.post<WithdrawResponse["data"]>(
        `/api/goals/${goalId}/transactions/withdraw`,
        data
      );

      if (response.success && response.data) {
        // Invalidate related caches
        await Promise.all([
          mutate(`/api/goals/${goalId}`),
          mutate("/api/goals"),
          mutate(`/api/goals/${goalId}/transactions`),
        ]);

        return response.data;
      }

      throw new Error(response.error || "Failed to withdraw from goal");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to withdraw from goal";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setIsLoading(false);
  };

  return {
    withdraw,
    isLoading,
    error,
    reset,
  };
};
