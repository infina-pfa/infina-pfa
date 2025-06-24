import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="bg-primary py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Start building your future —<br />
          one small step at a time
        </h2>
        <p className="text-xl text-white text-opacity-90 mb-10 max-w-2xl mx-auto">
          Join thousands of professionals who&apos;ve transformed their
          financial lives with personalized AI guidance
        </p>

        <Button
          size="lg"
          variant="secondary"
          className="text-lg px-8 py-6 bg-white text-primary hover:bg-opacity-90 mb-4"
        >
          Create your plan — free
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        <p className="text-white text-opacity-90 text-sm">
          No credit card required • Get started in under 2 minutes
        </p>
      </div>
    </section>
  );
}
