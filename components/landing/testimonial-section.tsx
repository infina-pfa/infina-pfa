"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export function TestimonialSection() {
  const { t } = useTranslation();

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <Card>
          <CardContent className="p-8 lg:p-12">
            <blockquote className="text-subhead text-foreground mb-8 leading-relaxed">
              &ldquo;{t("testimonialQuote")}&rdquo;
            </blockquote>

            <Card className="bg-section-bg max-w-2xl mx-auto border-0 shadow-none">
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src="/testimotional.png"
                      alt="Sarah M. - Marketing Manager testimonial photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-base">
                      {t("testimonialName")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("testimonialRole")}
                    </p>
                  </div>
                </div>
                <p className="text-foreground text-left italic text-base">
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
