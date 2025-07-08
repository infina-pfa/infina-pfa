"use client";

import { useAppTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { CheckCircle, MessageSquare } from "lucide-react";

interface SuccessStepProps {
  onStartChat: () => void;
}

export function SuccessStep({ onStartChat }: SuccessStepProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      {/* Success Icon */}
      <div className="w-24 h-24 mx-auto bg-[#F0F2F5] rounded-full flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-[#2ECC71]" />
      </div>

      {/* Success Content */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-[#111827] font-nunito">
          {t("successTitle")}
        </h1>
        <p className="text-xl text-[#2ECC71] font-medium font-nunito">
          {t("successSubtitle")}
        </p>
        <p className="text-lg text-[#6B7280] leading-relaxed max-w-xl mx-auto font-nunito">
          {t("successDescription")}
        </p>
      </div>

      {/* Start Chat Button */}
      <div className="pt-4">
        <Button
          onClick={onStartChat}
          size="lg"
          className="px-8 py-6 text-base cursor-pointer font-nunito"
        >
          {t("startChatButton")}
          <MessageSquare className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
