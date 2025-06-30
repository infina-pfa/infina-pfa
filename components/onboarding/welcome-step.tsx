"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      {/* Welcome Icon */}
      <div className="w-24 h-24 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-blue-500" />
      </div>

      {/* Welcome Content */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          {t("welcomeTitle")}
        </h1>
        <p className="text-xl text-blue-500 font-medium">
          {t("welcomeSubtitle")}
        </p>
        <p className="text-lg text-gray-600 leading-relaxed max-w-xl mx-auto">
          {t("welcomeDescription")}
        </p>
      </div>

      {/* Continue Button */}
      <div className="pt-4">
        <Button
          onClick={onNext}
          size="lg"
          className="px-8 py-6 text-base cursor-pointer"
        >
          {t("continueButton")}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
