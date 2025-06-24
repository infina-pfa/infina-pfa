"use client";

import { MessageCircle, Brain, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export function HowItWorksSection() {
  const { t } = useTranslation();
  return (
    <section className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-foreground text-center mb-16">
          {t("howItWorksTitle")}
        </h2>

        <div className="grid md:grid-cols-3 gap-12">
          <Card className="text-center border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
              <div className="w-20 h-20 bg-section-bg rounded-lg flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-infina-blue" />
              </div>
              <CardTitle className="text-2xl mb-4">
                {t("howItWorksStep1Title")}
              </CardTitle>
              <CardDescription className="text-lg">
                {t("howItWorksStep1Description")}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
              <div className="w-20 h-20 bg-section-bg rounded-lg flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-infina-green" />
              </div>
              <CardTitle className="text-2xl mb-4">
                {t("howItWorksStep2Title")}
              </CardTitle>
              <CardDescription className="text-lg">
                {t("howItWorksStep2Description")}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
              <div className="w-20 h-20 bg-section-bg rounded-lg flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-infina-orange" />
              </div>
              <CardTitle className="text-2xl mb-4">
                {t("howItWorksStep3Title")}
              </CardTitle>
              <CardDescription className="text-lg">
                {t("howItWorksStep3Description")}
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
