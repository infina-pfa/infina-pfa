import { useState } from "react";
import { mutate } from "swr";
import { goalService } from "@/lib/services-v2/goal.service";
import { useAppTranslation } from "@/hooks/use-translation";
import type { UpdateGoalRequest, Goal } from "@/lib/types/goal.types";

interface UseGoalUpdateSWRReturn {
  updateGoal: (id: string, data: UpdateGoalRequest) => Promise<Goal | null>;
  isUpdating: boolean;
  error: string | null;
}

interface UseGoalUpdateSWRProps {
  onSuccess?: (goal: Goal) => Promise<void> | void;
}

export function useGoalUpdateSWR({
  onSuccess,
}: UseGoalUpdateSWRProps = {}): UseGoalUpdateSWRReturn {
  const { t } = useAppTranslation(["common"]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateGoal = async (
    id: string,
    data: UpdateGoalRequest
  ): Promise<Goal | null> => {
    try {
      setIsUpdating(true);
      setError(null);

      // Call existing service
      const response = await goalService.update(id, data, t);

      if (response.error) {
        setError(response.error);
        return null;
      }

      if (response.goal) {
        // ✨ SWR Magic: Invalidate all goal queries to trigger re-fetch
        await mutate(
          (key) => Array.isArray(key) && key[0] === "goals",
          undefined,
          { revalidate: true }
        );

        // Also invalidate the specific goal
        await mutate(
          (key) => Array.isArray(key) && key[0] === "goal" && key[1] === id,
          undefined,
          { revalidate: true }
        );

        // Call success callback if provided
        if (onSuccess) {
          try {
            onSuccess(response.goal);
          } catch (callbackError) {
            console.error("Goal update callback failed:", callbackError);
          }
        }

        return response.goal;
      }

      return null;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : t("unknownError", { ns: "common" });
      setError(errorMessage);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateGoal,
    isUpdating,
    error,
  };
}
