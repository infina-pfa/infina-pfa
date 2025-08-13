import { useState } from "react";
import { mutate } from "swr";
import { userService } from "@/lib/services-v2/user.service";
import { useAppTranslation } from "@/hooks/use-translation";
import type {
  UserUpdate,
  UserProfile,
  BudgetingStyle,
} from "@/lib/types/user.types";

interface UseUserUpdateSWRReturn {
  updateUserProfile: (updates: UserUpdate) => Promise<UserProfile | null>;
  updateBudgetingStyle: (
    budgetingStyle: BudgetingStyle
  ) => Promise<UserProfile | null>;
  updateFinancialStage: (financialStage: string) => Promise<UserProfile | null>;
  updateFinancialMetadata: (
    metadata: Record<string, unknown>
  ) => Promise<UserProfile | null>;
  isUpdating: boolean;
  error: string | null;
}

interface UseUserUpdateSWRProps {
  onSuccess?: (user: UserProfile) => Promise<void> | void;
}

export function useUserUpdateSWR({
  onSuccess,
}: UseUserUpdateSWRProps = {}): UseUserUpdateSWRReturn {
  const { t } = useAppTranslation(["common"]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUserProfile = async (
    updates: UserUpdate
  ): Promise<UserProfile | null> => {
    try {
      setIsUpdating(true);
      setError(null);

      // Call existing service
      const response = await userService.updateUserProfile(updates, t);

      if (response.error) {
        setError(response.error);
        return null;
      }

      if (response.user) {
        // ✨ SWR Magic: Invalidate all user queries to trigger re-fetch
        await mutate(
          (key) => Array.isArray(key) && key[0] === "user",
          undefined,
          { revalidate: true }
        );

        // Call success callback if provided
        if (onSuccess) {
          try {
            await onSuccess(response.user);
          } catch (callbackError) {
            console.error("User update callback failed:", callbackError);
          }
        }

        return response.user;
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

  const updateBudgetingStyle = async (
    budgetingStyle: BudgetingStyle
  ): Promise<UserProfile | null> => {
    try {
      setIsUpdating(true);
      setError(null);

      // Call existing service
      const response = await userService.updateBudgetingStyle(
        budgetingStyle,
        t
      );

      if (response.error) {
        setError(response.error);
        return null;
      }

      if (response.user) {
        // ✨ SWR Magic: Invalidate all user queries to trigger re-fetch
        await mutate(
          (key) => Array.isArray(key) && key[0] === "user",
          undefined,
          { revalidate: true }
        );

        // Call success callback if provided
        if (onSuccess) {
          try {
            await onSuccess(response.user);
          } catch (callbackError) {
            console.error("User update callback failed:", callbackError);
          }
        }

        return response.user;
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

  const updateFinancialStage = async (
    financialStage: string
  ): Promise<UserProfile | null> => {
    try {
      setIsUpdating(true);
      setError(null);

      // Call existing service
      const response = await userService.updateFinancialStage(
        financialStage,
        t
      );

      if (response.error) {
        setError(response.error);
        return null;
      }

      if (response.user) {
        // ✨ SWR Magic: Invalidate all user queries to trigger re-fetch
        await mutate(
          (key) => Array.isArray(key) && key[0] === "user",
          undefined,
          { revalidate: true }
        );

        // Call success callback if provided
        if (onSuccess) {
          try {
            await onSuccess(response.user);
          } catch (callbackError) {
            console.error("User update callback failed:", callbackError);
          }
        }

        return response.user;
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

  const updateFinancialMetadata = async (
    metadata: Record<string, unknown>
  ): Promise<UserProfile | null> => {
    try {
      setIsUpdating(true);
      setError(null);

      // Call existing service
      const response = await userService.updateFinancialMetadata(metadata, t);

      if (response.error) {
        setError(response.error);
        return null;
      }

      if (response.user) {
        // ✨ SWR Magic: Invalidate all user queries to trigger re-fetch
        await mutate(
          (key) => Array.isArray(key) && key[0] === "user",
          undefined,
          { revalidate: true }
        );

        // Call success callback if provided
        if (onSuccess) {
          try {
            await onSuccess(response.user);
          } catch (callbackError) {
            console.error("User update callback failed:", callbackError);
          }
        }

        return response.user;
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
    updateUserProfile,
    updateBudgetingStyle,
    updateFinancialStage,
    updateFinancialMetadata,
    isUpdating,
    error,
  };
}
