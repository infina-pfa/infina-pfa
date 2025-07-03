"use client";

import { useAppTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Brain,
  Calculator,
  TrendingUp,
  Target,
} from "lucide-react";

interface IntroductionStepProps {
  onNext: () => void;
}

const features = [
  {
    icon: Brain,
    titleKey: "introFeature1Title",
    descriptionKey: "introFeature1Description",
  },
  {
    icon: Calculator,
    titleKey: "introFeature2Title",
    descriptionKey: "introFeature2Description",
  },
  {
    icon: TrendingUp,
    titleKey: "introFeature3Title",
    descriptionKey: "introFeature3Description",
  },
  {
    icon: Target,
    titleKey: "introFeature4Title",
    descriptionKey: "introFeature4Description",
  },
];

export function IntroductionStep({ onNext }: IntroductionStepProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-[#111827] font-nunito">
          {t("introductionTitle")}
        </h1>
        <p className="text-xl text-[#6B7280] font-nunito">
          {t("introductionSubtitle")}
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="bg-white p-6 rounded-xl space-y-4 transition-all duration-200 hover:bg-[#F0F2F5]"
            >
              <div className="w-12 h-12 bg-[#F0F2F5] rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6 text-[#0055FF]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-[#111827] font-nunito">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-[#6B7280] leading-relaxed font-nunito">
                  {t(feature.descriptionKey)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue Button */}
      <div className="text-center pt-4">
        <Button
          onClick={onNext}
          size="lg"
          className="px-8 py-6 text-base cursor-pointer font-nunito"
        >
          {t("nextStep")}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
