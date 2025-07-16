import useSWR from "swr";
import { userService } from "@/lib/services/user.service";
import { useAppTranslation } from "@/hooks/use-translation";
import type { UserProfile } from "@/lib/types/user.types";

interface UseUserProfileSWRReturn {
  data: UserProfile | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

export function useUserProfileSWR(): UseUserProfileSWRReturn {
  const { t } = useAppTranslation(["common"]);

  const {
    data: response,
    error,
    isLoading,
    mutate,
  } = useSWR(
    ["user", "profile"],
    () => userService.getUserProfile(t),
    {
      refreshInterval: 0, // Don't auto-refresh user profile
      revalidateOnFocus: false, // Don't revalidate on window focus
      revalidateOnReconnect: true, // Revalidate on network reconnect
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  return {
    data: response?.user || null,
    error: response?.error || (error ? t("unknownError") : null),
    loading: isLoading,
    refetch: mutate,
  };
}