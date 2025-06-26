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
    <footer className="bg-white py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">
              {t("footerCompanyName")}
            </h3>
            <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
              {t("footerCompanyDescription")}
            </p>
            <div className="flex gap-3 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 sm:w-10 sm:h-10"
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 sm:w-10 sm:h-10"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">
              {t("productSection")}
            </h4>
            <ul className="space-y-2 sm:space-y-3 text-muted-foreground text-sm sm:text-base">
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
            <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">
              {t("companySection")}
            </h4>
            <ul className="space-y-2 sm:space-y-3 text-muted-foreground text-sm sm:text-base">
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
            <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">
              {t("legalSection")}
            </h4>
            <ul className="space-y-2 sm:space-y-3 text-muted-foreground text-sm sm:text-base">
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
        <Card className="mb-6 sm:mb-8 bg-section-bg border-0 shadow-none">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto text-center">
              <CardTitle className="text-lg sm:text-xl mb-2">
                {t("newsletterTitle")}
              </CardTitle>
              <CardDescription className="mb-4 sm:mb-6 text-sm sm:text-base">
                {t("newsletterDescription")}
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  className="flex-1 bg-white text-sm sm:text-base"
                />
                <Button className="sm:whitespace-nowrap text-sm sm:text-base">
                  {t("subscribeButton")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="border-t border-divider pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4 sm:gap-0">
            <p className="text-muted-foreground text-xs sm:text-sm">
              {t("allRightsReservedFull")}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">
              {t("madeWithLove")} <span className="text-infina-red">♥</span>{" "}
              {t("forFinancialFreedom")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
