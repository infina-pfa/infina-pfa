import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center">
        {/* Infina Logo */}
        <div className="mb-8">
          <Image
            src="/infina-logo.png"
            alt="Infina"
            width={200}
            height={60}
            className="mx-auto"
            priority
          />
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          Your AI Financial Coach —<br />
          <span className="text-primary">One Step Closer to Freedom</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
          Track your money. Get smart advice. Grow your wealth — without
          overwhelm.
        </p>

        <Button size="lg" className="text-lg px-8 py-6 mb-12">
          Start your free journey
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        {/* App Preview Mockup */}
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="bg-section-bg rounded-md p-6 text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-md flex items-center justify-center font-semibold">
                  AI
                </div>
                <div>
                  <p className="font-semibold">Your AI coach</p>
                  <p className="text-sm text-muted-foreground">Online now</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-md p-4">
                  <p className="text-foreground">
                    I noticed you spent $247 on dining out this week.
                    That&apos;s 23% more than your usual budget. Would you like
                    me to suggest some strategies to help you stay on track?
                  </p>
                </div>
                <div className="bg-primary text-primary-foreground rounded-md p-4 ml-8">
                  <p>Yes, please help me with that</p>
                </div>
                <div className="bg-white rounded-md p-4">
                  <p className="text-foreground">
                    Great! Here are 3 simple steps: 1) Try meal prepping on
                    Sundays, 2) Set a daily dining limit of $25, 3) I&apos;ll
                    send you a gentle reminder when you&apos;re close to your
                    limit. Sound good?
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
