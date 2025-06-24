"use client";

import {
  CreditCard,
  Building,
  TrendingUp,
  BarChart3,
  Shield,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export function FinancialStagesSection() {
  const { t } = useTranslation();
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-foreground text-center mb-4">
          {t("financialStagesMainTitle")}
        </h2>
        <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
          {t("financialStagesMainDescription")}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent>
              <div className="w-16 h-16 bg-infina-red bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-infina-red" />
              </div>
              <CardTitle className="mb-3">{t("stageDebtTitle")}</CardTitle>
              <CardDescription>{t("stageDebtDescription")}</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent>
              <div className="w-16 h-16 bg-infina-blue bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-infina-blue" />
              </div>
              <CardTitle className="mb-3">{t("stageBuildingTitle")}</CardTitle>
              <CardDescription>{t("stageBuildingDescription")}</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent>
              <div className="w-16 h-16 bg-infina-green bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-infina-green" />
              </div>
              <CardTitle className="mb-3">{t("stageInvestingTitle")}</CardTitle>
              <CardDescription>
                {t("stageInvestingDescription")}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent>
              <div className="w-16 h-16 bg-infina-orange bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-infina-orange" />
              </div>
              <CardTitle className="mb-3">{t("stageOptimizeTitle")}</CardTitle>
              <CardDescription>{t("stageOptimizeDescription")}</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent>
              <div className="w-16 h-16 bg-infina-yellow bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-infina-yellow" />
              </div>
              <CardTitle className="mb-3">{t("stageProtectTitle")}</CardTitle>
              <CardDescription>{t("stageProtectDescription")}</CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
