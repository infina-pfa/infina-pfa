import { useState } from "react";
import { mutate } from "swr";
import { goalService } from "@/lib/services/goal.service";
import { useAppTranslation } from "@/hooks/use-translation";
import type { CreateGoalRequest, Goal } from "@/lib/types/goal.types";

interface UseGoalCreateSWRReturn {
  createGoal: (data: CreateGoalRequest) => Promise<Goal | null>;
  isCreating: boolean;
  error: string | null;
}

interface UseGoalCreateSWRProps {
  onSuccess?: (goal: Goal) => Promise<void> | void;
}

export function useGoalCreateSWR({
  onSuccess,
}: UseGoalCreateSWRProps = {}): UseGoalCreateSWRReturn {
  const { t } = useAppTranslation(["common"]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGoal = async (data: CreateGoalRequest): Promise<Goal | null> => {
    try {
      setIsCreating(true);
      setError(null);

      // Call existing service
      const response = await goalService.create(data, t);

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

        // Call success callback if provided
        if (onSuccess) {
          try {
            onSuccess(response.goal);
          } catch (callbackError) {
            console.error("Goal creation callback failed:", callbackError);
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
      setIsCreating(false);
    }
  };

  return {
    createGoal,
    isCreating,
    error,
  };
}
