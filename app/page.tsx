import { CTASection } from "@/components/landing/cta-section";
import { FinancialStagesSection } from "@/components/landing/financial-stages-section";
import { Footer } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { TestimonialSection } from "@/components/landing/testimonial-section";
import { Header } from "@/components/ui/header";

export default function Home() {
  return (
    <div className="min-h-screen bg-app-bg font-nunito">
      <Header />
      <HeroSection />
      <HowItWorksSection />
      <FinancialStagesSection />
      <TestimonialSection />
      <CTASection />
      <Footer />
    </div>
  );
}
