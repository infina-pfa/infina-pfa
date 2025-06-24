import {
  CreditCard,
  Building,
  TrendingUp,
  BarChart3,
  Shield,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function FinancialStagesSection() {
  return (
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
                Strategic plans to eliminate debt and break free from financial
                stress
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
  );
}
