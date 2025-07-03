"use client";

import { Bot } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";

export function OnboardingTypingIndicator() {
  const { t } = useAppTranslation(["onboarding", "common"]);

  return (
    <div className="flex justify-start mb-4">
      <div className="flex max-w-[80%]">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[#0055FF] text-white mr-3">
          <Bot className="w-4 h-4" />
        </div>

        {/* Typing animation */}
        <div className="bg-[#F0F2F5] px-4 py-3 rounded-2xl">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[#6B7280]">{t("aiIsTyping")}</span>
            <div className="flex space-x-1">
              <div
                className="w-2 h-2 bg-[#6B7280] rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 bg-[#6B7280] rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 bg-[#6B7280] rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 