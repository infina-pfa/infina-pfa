"use client";

import { Bot } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";

export function OnboardingTypingIndicator() {
  const { t } = useAppTranslation(["onboarding", "common"]);

  return (
    <div className="flex justify-start mb-3 sm:mb-4 animate-fadeIn">
      <div className="flex max-w-[90%] sm:max-w-[80%]">
        {/* Avatar */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[#0055FF] text-white mr-2 sm:mr-3">
          <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
        </div>

        {/* Typing animation */}
        <div className="bg-[#F0F2F5] px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[#6B7280]">{t("aiIsTyping")}</span>
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#6B7280] rounded-full typing-dot" />
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#6B7280] rounded-full typing-dot" />
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#6B7280] rounded-full typing-dot" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 