"use client";

import { CardTitle, CardDescription } from "@/components/ui/card";
import { MessageCircle, Brain, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

export function HowItWorksSection() {
  const { t } = useTranslation();
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-center mb-8 sm:mb-12 lg:mb-16">
          {t("howItWorksTitle")}
        </h2>

        <div className="space-y-16 lg:space-y-24">
          {/* Step 1 */}
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="flex-1 lg:order-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </div>
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl text-foreground">
                  {t("howItWorksStep1Title")}
                </CardTitle>
              </div>
              <CardDescription className="text-base sm:text-lg lg:text-xl leading-relaxed text-muted-foreground max-w-lg">
                {t("howItWorksStep1Description")}
              </CardDescription>
            </div>
            <div className="flex-1 lg:order-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl blur-3xl"></div>
                <div className="relative bg-section-bg rounded-2xl p-6 sm:p-8 border border-primary/10">
                  <img
                    src="/how-it-work/step-1.png"
                    alt="Step 1: Chat with AI financial coach"
                    className="w-full h-auto rounded-xl shadow-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="flex-1 lg:order-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-success/10 rounded-2xl flex items-center justify-center">
                  <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-success" />
                </div>
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl text-foreground">
                  {t("howItWorksStep2Title")}
                </CardTitle>
              </div>
              <CardDescription className="text-base sm:text-lg lg:text-xl leading-relaxed text-muted-foreground max-w-lg">
                {t("howItWorksStep2Description")}
              </CardDescription>
            </div>
            <div className="flex-1 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-success/10 rounded-2xl blur-3xl"></div>
                <div className="relative bg-section-bg rounded-2xl p-6 sm:p-8 border border-success/10">
                  <img
                    src="/how-it-work/step-2.png"
                    alt="Step 2: AI analyzes your financial situation"
                    className="w-full h-auto rounded-xl shadow-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="flex-1 lg:order-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-warning/10 rounded-2xl flex items-center justify-center">
                  <Target className="w-6 h-6 sm:w-7 sm:h-7 text-warning" />
                </div>
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl text-foreground">
                  {t("howItWorksStep3Title")}
                </CardTitle>
              </div>
              <CardDescription className="text-base sm:text-lg lg:text-xl leading-relaxed text-muted-foreground max-w-lg">
                {t("howItWorksStep3Description")}
              </CardDescription>
            </div>
            <div className="flex-1 lg:order-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-warning/10 rounded-2xl blur-3xl"></div>
                <div className="relative bg-section-bg rounded-2xl p-6 sm:p-8 border border-warning/10">
                  <img
                    src="/how-it-work/step-3.png"
                    alt="Step 3: Get personalized action plan"
                    className="w-full h-auto rounded-xl shadow-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
