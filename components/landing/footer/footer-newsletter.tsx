"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export function FooterNewsletter() {
  const { t } = useTranslation();

  return (
    <Card className="mb-6 sm:mb-8 bg-section-bg border-0">
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
  );
}
