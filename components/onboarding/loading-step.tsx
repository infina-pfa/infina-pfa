"use client";

import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

interface LoadingStepProps {
  message?: string; // Optional loading message
}

export function LoadingStep({ message = "" }: LoadingStepProps) {
  const { t } = useTranslation();

  // Use message if provided, otherwise use default translation
  const loadingMessage = message || t("settingUpAccount");

  return (
    <div className="max-w-lg mx-auto text-center space-y-8">
      {/* Loading Icon */}
      <div className="w-24 h-24 mx-auto bg-[#F0F2F5] rounded-full flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#0055FF] animate-spin" />
      </div>

      {/* Loading Content */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-[#111827] font-nunito">
          {t("creatingProfile")}
        </h1>
        <p className="text-xl text-[#6B7280] font-nunito">{loadingMessage}</p>
        <p className="text-lg text-[#6B7280] font-nunito">{t("almostReady")}</p>
      </div>

      {/* Loading indicator dots */}
      <div className="flex justify-center space-x-2">
        <div className="w-2 h-2 bg-[#0055FF] rounded-full animate-bounce"></div>
        <div
          className="w-2 h-2 bg-[#0055FF] rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-2 h-2 bg-[#0055FF] rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
    </div>
  );
}
