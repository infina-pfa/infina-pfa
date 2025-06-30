"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleSignUp = () => {
    router.push("/auth/sign-up");
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
      <div className="text-center">
        <h1 className="text-hero text-foreground mb-6 leading-tight">
          {t("heroMainTitle")}
          <br />
          <span className="text-primary">{t("heroSubTitle")}</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
          {t("heroDescription")}
        </p>

        <Button
          size="lg"
          onClick={handleSignUp}
          className="text-base px-8 py-6 mb-12 cursor-pointer"
        >
          {t("startFreeJourney")}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        {/* Hero Image */}
        <div className="max-w-4xl mx-auto">
          <img
            src="/hero.png"
            alt="Infina AI financial coach interface showing personalized advice and dashboard"
            className="w-full h-auto rounded-xl"
          />
        </div>
      </div>
    </section>
  );
}
