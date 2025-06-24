import {
  DollarSign,
  CreditCard,
  TrendingUp,
  MessageCircle,
  Target,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function KeyFeaturesSection() {
  return (
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
                    Get personalized strategies to pay off debt faster and save
                    thousands in interest
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
                    Build wealth with tailored investment recommendations based
                    on your risk tolerance
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
  );
}
