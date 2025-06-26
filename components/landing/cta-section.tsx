"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function CTASection() {
  const { t } = useTranslation();
  return (
    <section className="bg-primary py-12 sm:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
          {t("ctaMainTitle")}
          <br />
          {t("ctaMainSubtitle")}
        </h2>
        <p className="text-lg sm:text-xl text-white text-opacity-90 mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
          {t("ctaMainDescription")}
        </p>

        <Button
          size="lg"
          variant="secondary"
          className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 bg-white text-primary hover:bg-opacity-90 mb-3 sm:mb-4"
        >
          {t("ctaMainButton")}
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
        </Button>

        <p className="text-white text-opacity-90 text-xs sm:text-sm px-4">
          {t("ctaDisclaimer")}
        </p>
      </div>
    </section>
  );
}
