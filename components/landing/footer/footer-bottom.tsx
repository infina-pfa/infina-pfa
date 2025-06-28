"use client";

import { useTranslation } from "react-i18next";

export function FooterBottom() {
  const { t } = useTranslation();

  return (
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
  );
}
