"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAppTranslation } from "@/hooks/use-translation";

export function TestimonialSection() {
  const { t } = useAppTranslation(["testimonials"]);
  
  // Get testimonials from translations
  const testimonials = t("testimonials", { returnObjects: true }) as Array<{
    name: string;
    role: string;
    text: string;
    image: string;
  }>;
  
  const testimonialQuote = t("testimonialQuote");
  
  // State for slider functionality
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Auto-slide functionality
  useEffect(() => {
    if (!isHovered && testimonials.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
      }, 4000); // Change slide every 4 seconds
      
      return () => clearInterval(interval);
    }
  }, [isHovered, testimonials.length]);
  
  // Calculate visible testimonials for current slide
  const visibleTestimonials = testimonials.slice(0, 3); // Show first 3 testimonials
  
  // Handle manual slide navigation
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };
  
  // Handle case when testimonials are not loaded yet
  if (!testimonials || testimonials.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
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
