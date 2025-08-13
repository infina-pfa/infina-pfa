import useSWR from "swr";
import { userService } from "@/lib/services-v2/user.service";
import { useAppTranslation } from "@/hooks/use-translation";
import type { UserProfile } from "@/lib/types/user.types";

interface UseUserProfileSWRReturn {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserProfileSWR(): UseUserProfileSWRReturn {
  const { t } = useAppTranslation(["common", "auth"]);

  const { data, error, isLoading, mutate } = useSWR(
    ["user-profile"],
    async () => {
      const response = await userService.getUserProfile(t);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    {
      // Custom config for user profile data
      revalidateOnFocus: true, // Revalidate when user focuses window
      dedupingInterval: 30000, // User profile can be cached for 30 seconds
      revalidateOnMount: true, // Always fetch fresh data on mount
    }
  );

  return {
    user: data?.user || null,
    loading: isLoading,
    error: error?.message || null,
    refetch: async () => {
      await mutate();
    },
  };
}
