"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useAppTranslation } from "@/hooks/use-translation";

export function TestimonialSection() {
  const { t } = useAppTranslation(["testimonials", "common"]);

  return (
    <section className="py-16 lg:py-20 bg-section-bg">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main quote */}
        <div className="text-center mb-12">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8 lg:p-12">
              <blockquote className="text-subhead text-foreground leading-relaxed">
                &ldquo;{testimonialQuote}&rdquo;
              </blockquote>
            </CardContent>
          </Card>
        </div>

        {/* Auto-sliding testimonials */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500 ease-in-out">
              {visibleTestimonials.map((testimonial, index) => (
                <Card 
                  key={`${currentIndex}-${index}`}
                  className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={testimonial.image}
                          alt={`${testimonial.name} testimonial photo`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-foreground text-base">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <p className="text-foreground text-left italic text-sm leading-relaxed">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center mt-8 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-primary"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
