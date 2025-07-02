"use client";

import { useAppTranslation } from "@/hooks/use-translation";

export function FooterLinks() {
  const { t } = useAppTranslation(["footer", "common"]);

  return (
    <>
      {/* Product Section */}
      <div>
        <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">
          {t("productSection")}
        </h4>
        <ul className="space-y-2 sm:space-y-3 text-muted-foreground text-sm sm:text-base">
          <li>
            <a href="#" className="hover:text-infina-blue transition-colors">
              {t("featuresLink")}
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-infina-blue transition-colors">
              {t("howItWorksLink")}
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-infina-blue transition-colors">
              {t("pricingLink")}
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-infina-blue transition-colors">
              {t("securityLink")}
            </a>
          </li>
        </ul>
      </div>

      {/* Company Section */}
      <div>
        <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">
          {t("companySection")}
        </h4>
        <ul className="space-y-2 sm:space-y-3 text-muted-foreground text-sm sm:text-base">
          <li>
            <a href="#" className="hover:text-infina-blue transition-colors">
              {t("aboutLink")}
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-infina-blue transition-colors">
              {t("faqLink")}
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-infina-blue transition-colors">
              {t("blogLink")}
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-infina-blue transition-colors">
              {t("contactLink")}
            </a>
          </li>
        </ul>
      </div>

      {/* Legal Section */}
      <div>
        <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">
          {t("legalSection")}
        </h4>
        <ul className="space-y-2 sm:space-y-3 text-muted-foreground text-sm sm:text-base">
          <li>
            <a href="#" className="hover:text-infina-blue transition-colors">
              {t("privacyLink")}
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-infina-blue transition-colors">
              {t("termsLink")}
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-infina-blue transition-colors">
              {t("cookiesLink")}
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-infina-blue transition-colors">
              {t("licensesLink")}
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
