"use client";

import { Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {t("footerCompanyName")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t("footerCompanyDescription")}
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon">
                <Users className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Mail className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">
              {t("productSection")}
            </h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  {t("featuresLink")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  {t("howItWorksLink")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  {t("pricingLink")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  {t("securityLink")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">
              {t("companySection")}
            </h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  {t("aboutLink")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  {t("faqLink")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  {t("blogLink")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  {t("contactLink")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">
              {t("legalSection")}
            </h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  {t("privacyLink")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  {t("termsLink")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  {t("cookiesLink")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-infina-blue transition-colors"
                >
                  {t("licensesLink")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <Card className="mb-8 bg-section-bg border-0 shadow-none">
          <CardContent className="p-8">
            <div className="max-w-2xl mx-auto text-center">
              <CardTitle className="text-xl mb-2">
                {t("newsletterTitle")}
              </CardTitle>
              <CardDescription className="mb-6">
                {t("newsletterDescription")}
              </CardDescription>
              <div className="flex gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  className="flex-1 bg-white"
                />
                <Button>{t("subscribeButton")}</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="border-t border-divider pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              {t("allRightsReservedFull")}
            </p>
            <p className="text-muted-foreground text-sm mt-4 md:mt-0">
              {t("madeWithLove")} <span className="text-infina-red">♥</span>{" "}
              {t("forFinancialFreedom")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
