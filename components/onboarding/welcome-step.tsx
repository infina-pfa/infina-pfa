"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const { t } = useTranslation();

  return (
    <div className="text-center space-y-8">
      {/* Welcome Content - following hero section design */}
      <div className="space-y-6">
        <h1 className="text-4xl lg:text-5xl font-bold text-[#111827] leading-tight">
          {t("welcomeTitle")}
        </h1>
        <p className="text-xl text-[#0055FF] font-medium">
          {t("welcomeSubtitle")}
        </p>
      </div>

      {/* Continue Button - following landing page style */}
      <div className="pt-8">
        <Button
          onClick={onNext}
          size="lg"
          className="text-base px-8 py-6 cursor-pointer"
        >
          {t("continueButton")}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
