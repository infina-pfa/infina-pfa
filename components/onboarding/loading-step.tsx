"use client";

import { useAppTranslation } from "@/hooks/use-translation";

interface LoadingStepProps {
  message?: string; // Optional loading message
}

export function LoadingStep({ message = "" }: LoadingStepProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);

  // Use message if provided, otherwise use default translation
  const loadingMessage = message || t("settingUpAccount");

  return (
    <div className="max-w-lg mx-auto text-center space-y-8">
      {/* Loading Content - following landing page design */}
      <div className="space-y-6">
        <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] leading-tight">
          {t("creatingProfile")}
        </h1>
        <p className="text-xl text-[#0055FF] font-medium">{loadingMessage}</p>
        <p className="text-lg text-[#6B7280]">{t("almostReady")}</p>
      </div>

      {/* Loading indicator - simplified */}
      <div className="flex justify-center space-x-2">
        <div className="w-3 h-3 bg-[#0055FF] rounded-full animate-bounce"></div>
        <div
          className="w-3 h-3 bg-[#0055FF] rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-3 h-3 bg-[#0055FF] rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
    </div>
  );
}
