"use client";

import { SWRConfig } from "swr";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
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
