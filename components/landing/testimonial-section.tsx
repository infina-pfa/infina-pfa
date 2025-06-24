"use client";

import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export function TestimonialSection() {
  const { t } = useTranslation();
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <Card>
          <CardContent className="p-12">
            <Heart className="w-16 h-16 text-infina-blue mx-auto mb-8" />
            <blockquote className="text-3xl md:text-4xl font-medium text-foreground mb-8 leading-relaxed">
              &ldquo;{t("testimonialQuote")}&rdquo;
            </blockquote>

            <Card className="bg-section-bg max-w-2xl mx-auto border-0 shadow-none">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-infina-green text-white rounded-lg flex items-center justify-center font-semibold">
                    SM
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">
                      {t("testimonialName")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("testimonialRole")}
                    </p>
                  </div>
                </div>
                <p className="text-foreground text-left italic">
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
