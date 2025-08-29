"use client";

import { useState } from "react";
import { onboardingService } from "@/lib/services/onboarding.service";
import { useAppTranslation } from "@/hooks/use-translation";

export function DevStartOverButton() {
  const [isResetting, setIsResetting] = useState(false);
  const { t } = useAppTranslation("onboarding");

  const handleStartOver = async () => {
    if (isResetting) return;

    const confirmed = window.confirm(t("startOverConfirmMessage"));

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

  return (
    <button
      onClick={handleStartOver}
      disabled={isResetting}
      className="text-xs text-gray-400 hover:text-gray-600 disabled:text-gray-300 font-nunito transition-colors duration-200 underline"
      title={t("startOver")}
    >
      {isResetting ? t("resetting") : t("startOver")}
    </button>
  );
}
