"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export function HeroSection() {
  const { t } = useTranslation();
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center">
        {/* Infina Logo */}
        <div className="mb-8">
          <Image
            src="/infina-logo.png"
            alt="Infina"
            width={200}
            height={60}
            className="mx-auto"
            priority
          />
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          {t("heroMainTitle")}
          <br />
          <span className="text-primary">{t("heroSubTitle")}</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
          {t("heroDescription")}
        </p>

        <Button size="lg" className="text-lg px-8 py-6 mb-12">
          {t("startFreeJourney")}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        {/* App Preview Mockup */}
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="bg-section-bg rounded-md p-6 text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-md flex items-center justify-center font-semibold">
                  AI
                </div>
                <div>
                  <p className="font-semibold">{t("aiCoach")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("onlineNow")}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-md p-4">
                  <p className="text-foreground">{t("aiMessage1")}</p>
                </div>
                <div className="bg-primary text-primary-foreground rounded-md p-4 ml-8">
                  <p>{t("userResponse")}</p>
                </div>
                <div className="bg-white rounded-md p-4">
                  <p className="text-foreground">{t("aiMessage2")}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
