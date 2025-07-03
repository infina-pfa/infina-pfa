"use client";

import {
  DollarSign,
  CreditCard,
  TrendingUp,
  MessageCircle,
  Target,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAppTranslation } from "@/hooks/use-translation";

export function KeyFeaturesSection() {
  const { t } = useAppTranslation(["keyFeatures", "common"]);
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-center mb-8 sm:mb-12 lg:mb-16">
          {t("keyFeaturesMainTitle")}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <div className="space-y-6 sm:space-y-8">
              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-infina-blue bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-infina-blue" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
                    {t("featureBudgetTitle")}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {t("featureBudgetDescription")}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-infina-red bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-infina-red" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
                    {t("featureDebtTitle")}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {t("featureDebtDescription")}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-infina-green bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-infina-green" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
                    {t("featureInvestmentTitle")}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {t("featureInvestmentDescription")}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-infina-orange bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-infina-orange" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
                    {t("featureAITitle")}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {t("featureAIDescription")}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-infina-yellow bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-infina-yellow" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
                    {t("featureProgressTitle")}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {t("featureProgressDescription")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-section-bg rounded-card p-4 sm:p-6 lg:p-8 mt-8 lg:mt-0">
            <Card className="mb-3 sm:mb-4 border-0 shadow-none">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-infina-green rounded-full"></div>
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {t("emergencyFund")}
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  $8,247
                </p>
                <p className="text-xs sm:text-sm text-infina-green">
                  ↗ 12% {t("thisMonth")}
                </p>
              </CardContent>
            </Card>

            <Card className="mb-3 sm:mb-4 border-0 shadow-none">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-infina-blue rounded-full"></div>
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {t("investments")}
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  $24,891
                </p>
                <p className="text-xs sm:text-sm text-infina-blue">
                  ↗ 8% {t("thisMonth")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-infina-orange rounded-full"></div>
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {t("debtPayoff")}
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  -$3,247
                </p>
                <p className="text-xs sm:text-sm text-infina-orange">
                  ↘ 15% {t("thisMonth")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
