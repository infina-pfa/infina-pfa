"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

export function CTASection() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleSignUp = () => {
    router.push("/auth/sign-up");
  };

  return (
    <section className="bg-primary py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-section text-white mb-6 leading-tight">
          {t("ctaMainTitle")}
          <br />
          {t("ctaMainSubtitle")}
        </h2>
        <p className="text-xl text-white text-opacity-90 mb-10 max-w-2xl mx-auto">
          {t("ctaMainDescription")}
        </p>

        <Button
          size="lg"
          variant="secondary"
          onClick={handleSignUp}
          className="text-base px-8 py-6 bg-white text-primary hover:bg-opacity-90 mb-4 cursor-pointer"
        >
          {t("ctaMainButton")}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        <p className="text-white text-opacity-90 text-sm">
          {t("ctaDisclaimer")}
        </p>
      </div>
    </section>
  );
}
