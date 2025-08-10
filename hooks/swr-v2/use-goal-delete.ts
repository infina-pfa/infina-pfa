import { useState } from "react";
import { mutate } from "swr";
import { goalService } from "@/lib/services-v2/goal.service";
import { useAppTranslation } from "@/hooks/use-translation";

interface UseGoalDeleteSWRReturn {
  deleteGoal: (id: string) => Promise<boolean>;
  isDeleting: boolean;
  error: string | null;
}

interface UseGoalDeleteSWRProps {
  onSuccess?: (id: string) => Promise<void> | void;
}

export function useGoalDeleteSWR({
  onSuccess,
}: UseGoalDeleteSWRProps = {}): UseGoalDeleteSWRReturn {
  const { t } = useAppTranslation(["common"]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteGoal = async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);

      // Call existing service
      const response = await goalService.delete(id, t);

      if (response.error) {
        setError(response.error);
        return false;
      }

      if (response.success) {
        // ✨ SWR Magic: Invalidate all goal queries to trigger re-fetch
        await mutate(
          (key) => Array.isArray(key) && key[0] === "goals",
          undefined,
          { revalidate: true }
        );

        // Call success callback if provided
        if (onSuccess) {
          try {
            onSuccess(id);
          } catch (callbackError) {
            console.error("Goal deletion callback failed:", callbackError);
          }
        }

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
    deleteGoal,
    isDeleting,
    error,
  };
}
