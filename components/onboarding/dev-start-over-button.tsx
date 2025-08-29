"use client";

import { useState } from "react";
import { onboardingService } from "@/lib/services/onboarding.service";
import { useAppTranslation } from "@/hooks/use-translation";

export function DevStartOverButton() {
  const [isResetting, setIsResetting] = useState(false);
  const { t } = useAppTranslation("onboarding");

  const handleStartOver = async () => {
    if (isResetting) return;
    
    const confirmed = window.confirm(
      t("startOverConfirmMessage")
    );
    
    if (!confirmed) return;

    try {
      setIsResetting(true);
      const result = await onboardingService.startOver();
      
      if (result.success) {
        // Reload the page to reset all state
        window.location.reload();
      } else {
        alert(t("startOverError"));
      }
    } catch (error) {
      console.error("Error resetting onboarding:", error);
      alert(t("startOverError"));
    } finally {
      setIsResetting(false);
    }
  };

  // Only show in development environment
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <button
      onClick={handleStartOver}
      disabled={isResetting}
      className="fixed bottom-6 right-6 z-50 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 font-nunito font-semibold"
      title={t("startOver")}
    >
      {isResetting ? t("resetting") : t("startOver")}
    </button>
  );
}