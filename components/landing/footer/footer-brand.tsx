"use client";

import { Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function FooterBrand() {
  const { t } = useTranslation();

  return (
    <div className="sm:col-span-2 lg:col-span-1">
      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">
        {t("footerCompanyName")}
      </h3>
      <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
        {t("footerCompanyDescription")}
      </p>
      <div className="flex gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" className="w-8 h-8 sm:w-10 sm:h-10">
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="w-8 h-8 sm:w-10 sm:h-10">
          <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>
    </div>
  );
}
