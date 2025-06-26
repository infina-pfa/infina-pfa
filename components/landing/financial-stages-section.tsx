"use client";

import { CreditCard, Building, TrendingUp, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FinancialStagesSection() {
  const { t } = useTranslation();

  const stages = [
    {
      id: "debt",
      icon: CreditCard,
      color: "bg-danger text-white",
      bgColor: "bg-danger/10",
      titleKey: "stageDebtTitle",
      descKey: "stageDebtDescription",
    },
    {
      id: "building",
      icon: Building,
      color: "bg-primary text-white",
      bgColor: "bg-primary/10",
      titleKey: "stageBuildingTitle",
      descKey: "stageBuildingDescription",
    },
    {
      id: "investing",
      icon: TrendingUp,
      color: "bg-success text-white",
      bgColor: "bg-success/10",
      titleKey: "stageInvestingTitle",
      descKey: "stageInvestingDescription",
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            {t("financialStagesMainTitle")}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            {t("financialStagesMainDescription")}
          </p>
        </div>

        {/* Desktop Horizontal Layout */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-16 left-16 right-16 h-0.5 bg-border"></div>

            <div className="flex justify-between items-start">
              {stages.map((stage) => {
                const IconComponent = stage.icon;
                return (
                  <div
                    key={stage.id}
                    className="flex flex-col items-center max-w-xs"
                  >
                    {/* Icon Circle */}
                    <div
                      className={`w-16 h-16 ${stage.color} rounded-full flex items-center justify-center mb-6 relative z-10 border-4 border-white shadow-sm`}
                    >
                      <IconComponent className="w-8 h-8" />
                    </div>

                    {/* Content */}
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        {t(stage.titleKey)}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {t(stage.descKey)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Vertical Layout */}
        <div className="lg:hidden space-y-8">
          {stages.map((stage, index) => {
            const IconComponent = stage.icon;
            const isLast = index === stages.length - 1;

            return (
              <div key={stage.id} className="relative">
                <div className="flex items-start gap-4 sm:gap-6">
                  {/* Icon and Line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 ${stage.color} rounded-full flex items-center justify-center flex-shrink-0`}
                    >
                      <IconComponent className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    {!isLast && (
                      <div className="w-0.5 h-16 bg-border mt-4"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                      {t(stage.titleKey)}
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                      {t(stage.descKey)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 lg:mt-16">
          <div className="inline-flex items-center gap-2 text-primary font-medium">
            <span className="text-sm sm:text-base">
              {t("startYourJourneyToday")}
            </span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </section>
  );
}
