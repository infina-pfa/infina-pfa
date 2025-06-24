import { Header } from "@/components/ui/header";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FinancialStagesSection } from "@/components/landing/financial-stages-section";
import { KeyFeaturesSection } from "@/components/landing/key-features-section";
import { TestimonialSection } from "@/components/landing/testimonial-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-app-bg font-nunito">
      <Header />
      <HeroSection />
      <HowItWorksSection />
      <FinancialStagesSection />
      <KeyFeaturesSection />
      <TestimonialSection />
      <CTASection />
      <Footer />
    </div>
  );
}
