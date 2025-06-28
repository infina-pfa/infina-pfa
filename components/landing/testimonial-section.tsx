"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export function TestimonialSection() {
  const { t } = useTranslation();
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <Card>
          <CardContent className="p-6 sm:p-8 lg:p-12">
            <blockquote className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-medium text-foreground mb-6 sm:mb-8 leading-relaxed px-4">
              &ldquo;{t("testimonialQuote")}&rdquo;
            </blockquote>

            <Card className="bg-section-bg max-w-2xl mx-auto border-0 shadow-none">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src="/testimotional.png"
                      alt="Sarah M. - Marketing Manager testimonial photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-sm sm:text-base">
                      {t("testimonialName")}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t("testimonialRole")}
                    </p>
                  </div>
                </div>
                <p className="text-foreground text-left italic text-sm sm:text-base">
                  &ldquo;{t("testimonialText")}&rdquo;
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
