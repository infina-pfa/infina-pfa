"use client";

import { SWRConfig } from "swr";
import { useToast } from "@/hooks/use-toast";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  const { error: showErrorToast } = useToast();

  return (
    <SWRConfig
      value={{
        // Global error handling using existing toast system
        onError: (error) => {
          console.error("SWR Error:", error);
          showErrorToast("Data fetch error", error.message);
        },

        // Global configuration optimized for your app
        revalidateOnFocus: false, // Disable revalidation on window focus for better UX
        revalidateOnReconnect: true, // Enable revalidation when network reconnects
        shouldRetryOnError: true, // Retry on errors
        errorRetryCount: 3, // Maximum retry count
        dedupingInterval: 2000, // Deduplicate requests within 2 seconds
        refreshInterval: 0, // Disable automatic polling by default

        // Keep data fresh but don't spam the server
        refreshWhenHidden: false,
        refreshWhenOffline: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}
