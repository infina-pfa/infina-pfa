"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useTranslation } from "react-i18next";

export function HeroSection() {
  const { t } = useTranslation();
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
          {t("heroMainTitle")}
          <br />
          <span className="text-primary">{t("heroSubTitle")}</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4">
          {t("heroDescription")}
        </p>

        <Button
          size="lg"
          className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 mb-8 sm:mb-12"
        >
          {t("startFreeJourney")}
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
        </Button>

        {/* Hero Image */}
        <div className="max-w-4xl mx-auto px-4">
          <img
            src="/hero.png"
            alt="Infina AI financial coach interface showing personalized advice and dashboard"
            className="w-full h-auto rounded-lg sm:rounded-xl shadow-none"
          />
        </div>
      </div>
    </section>
  );
}
