import {
  ArrowRight,
  MessageCircle,
  Target,
  TrendingUp,
  CreditCard,
  Building,
  DollarSign,
  Shield,
  BarChart3,
  Brain,
  Heart,
  Users,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-app-bg font-nunito">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center">
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
                      That&apos;s 23% more than your usual budget. Would you
                      like me to suggest some strategies to help you stay on
                      track?
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

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">
            How it works
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <Card className="text-center border-0 shadow-none bg-transparent">
              <CardContent className="p-0">
                <div className="w-20 h-20 bg-section-bg rounded-lg flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-10 h-10 text-infina-blue" />
                </div>
                <CardTitle className="text-2xl mb-4">
                  Answer a few questions
                </CardTitle>
                <CardDescription className="text-lg">
                  Tell us about your goals, income, and current financial
                  situation through a simple onboarding process
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-none bg-transparent">
              <CardContent className="p-0">
                <div className="w-20 h-20 bg-section-bg rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-10 h-10 text-infina-green" />
                </div>
                <CardTitle className="text-2xl mb-4">
                  Meet your AI coach
                </CardTitle>
                <CardDescription className="text-lg">
                  Get personalized insights and advice tailored to your unique
                  financial stage and goals
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-none bg-transparent">
              <CardContent className="p-0">
                <div className="w-20 h-20 bg-section-bg rounded-lg flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-10 h-10 text-infina-orange" />
                </div>
                <CardTitle className="text-2xl mb-4">
                  Take small daily steps
                </CardTitle>
                <CardDescription className="text-lg">
                  Build lasting financial habits through guided daily actions
                  and consistent progress tracking
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Personalized Financial Stages */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-foreground text-center mb-4">
            Advice that grows with you
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
            No matter where you are in your financial journey, we meet you there
            and guide you forward
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent>
                <div className="w-16 h-16 bg-infina-red bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-infina-red" />
                </div>
                <CardTitle className="mb-3">Debt</CardTitle>
                <CardDescription>
                  Strategic plans to eliminate debt and break free from
                  financial stress
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent>
                <div className="w-16 h-16 bg-infina-blue bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-infina-blue" />
                </div>
                <CardTitle className="mb-3">Building foundation</CardTitle>
                <CardDescription>
                  Establish emergency funds and create strong financial
                  fundamentals
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent>
                <div className="w-16 h-16 bg-infina-green bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-infina-green" />
                </div>
                <CardTitle className="mb-3">Start investing</CardTitle>
                <CardDescription>
                  Learn investment basics and begin building long-term wealth
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent>
                <div className="w-16 h-16 bg-infina-orange bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-infina-orange" />
                </div>
                <CardTitle className="mb-3">Optimize assets</CardTitle>
                <CardDescription>
                  Fine-tune your portfolio and maximize returns on your
                  investments
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent>
                <div className="w-16 h-16 bg-infina-yellow bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-infina-yellow" />
                </div>
                <CardTitle className="mb-3">Protect assets</CardTitle>
                <CardDescription>
                  Safeguard your wealth with insurance and estate planning
                  strategies
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">
            Everything you need in one place
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-infina-blue bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-6 h-6 text-infina-blue" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Budget tracking
                    </h3>
                    <p className="text-muted-foreground">
                      Automatically categorize expenses and track spending
                      patterns with intelligent insights
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-infina-red bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-6 h-6 text-infina-red" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Debt guidance
                    </h3>
                    <p className="text-muted-foreground">
                      Get personalized strategies to pay off debt faster and
                      save thousands in interest
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-infina-green bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-infina-green" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Investment planning
                    </h3>
                    <p className="text-muted-foreground">
                      Build wealth with tailored investment recommendations
                      based on your risk tolerance
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-infina-orange bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-infina-orange" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      AI micro-interactions
                    </h3>
                    <p className="text-muted-foreground">
                      Daily check-ins and smart notifications to keep you
                      motivated and on track
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-infina-yellow bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-infina-yellow" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Progress tracking
                    </h3>
                    <p className="text-muted-foreground">
                      Visualize your financial growth with clear milestones and
                      achievement celebrations
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-section-bg rounded-card p-8">
              <Card className="mb-4 border-0 shadow-none">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-infina-green rounded-full"></div>
                    <span className="text-sm font-medium text-muted-foreground">
                      EMERGENCY FUND
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">$8,247</p>
                  <p className="text-sm text-infina-green">↗ 12% this month</p>
                </CardContent>
              </Card>

              <Card className="mb-4 border-0 shadow-none">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-infina-blue rounded-full"></div>
                    <span className="text-sm font-medium text-muted-foreground">
                      INVESTMENTS
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">$24,891</p>
                  <p className="text-sm text-infina-blue">↗ 8% this month</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-none">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-infina-orange rounded-full"></div>
                    <span className="text-sm font-medium text-muted-foreground">
                      DEBT PAYOFF
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">-$3,247</p>
                  <p className="text-sm text-infina-orange">↘ 15% this month</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Works */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Card>
            <CardContent className="p-12">
              <Heart className="w-16 h-16 text-infina-blue mx-auto mb-8" />
              <blockquote className="text-3xl md:text-4xl font-medium text-foreground mb-8 leading-relaxed">
                &ldquo;You don&apos;t need to be a finance expert. You just need
                a coach who meets you where you are — and keeps showing
                up.&rdquo;
              </blockquote>

              <Card className="bg-section-bg max-w-2xl mx-auto border-0 shadow-none">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-infina-green text-white rounded-lg flex items-center justify-center font-semibold">
                      SM
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">Sarah M.</p>
                      <p className="text-sm text-muted-foreground">
                        Marketing Manager, 29
                      </p>
                    </div>
                  </div>
                  <p className="text-foreground text-left italic">
                    &ldquo;I went from avoiding my finances to actually looking
                    forward to my weekly check-ins. My AI coach doesn&apos;t
                    judge — it just helps me make better decisions, one small
                    step at a time. I&apos;ve saved $3,000 in just 4
                    months!&rdquo;
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
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

      {/* Footer */}
      <footer className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Infina PFA
              </h3>
              <p className="text-muted-foreground mb-6">
                Your AI-powered personal financial advisor, helping you build
                wealth one step at a time.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon">
                  <Users className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Mail className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-infina-blue transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-infina-blue transition-colors"
                  >
                    How it works
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-infina-blue transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-infina-blue transition-colors"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-infina-blue transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-infina-blue transition-colors"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-infina-blue transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-infina-blue transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-infina-blue transition-colors"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-infina-blue transition-colors"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-infina-blue transition-colors"
                  >
                    Cookies
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-infina-blue transition-colors"
                  >
                    Licenses
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter Signup */}
          <Card className="mb-8 bg-section-bg border-0 shadow-none">
            <CardContent className="p-8">
              <div className="max-w-2xl mx-auto text-center">
                <CardTitle className="text-xl mb-2">Stay updated</CardTitle>
                <CardDescription className="mb-6">
                  Get financial tips, product updates, and exclusive insights
                  delivered to your inbox
                </CardDescription>
                <div className="flex gap-4 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 bg-white"
                  />
                  <Button>Subscribe</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="border-t border-divider pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-muted-foreground text-sm">
                © 2025 Infina PFA. All rights reserved.
              </p>
              <p className="text-muted-foreground text-sm mt-4 md:mt-0">
                Made with <span className="text-infina-red">♥</span> for your
                financial freedom
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
