import { ArrowRight, BookOpen, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-app-bg font-nunito">
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Welcome to Infina PFA
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your personal financial assistant powered by intelligent insights
            and modern design
          </p>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <button className="bg-infina-blue text-white px-8 py-4 font-medium text-lg hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              Get started
            </button>
            <button className="bg-section-bg text-foreground px-8 py-4 font-medium text-lg hover:bg-opacity-80 transition-colors flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5" />
              Learn more
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 text-center">
            <div className="w-16 h-16 bg-section-bg flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-infina-blue" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Smart insights
            </h3>
            <p className="text-muted-foreground">
              Get intelligent financial insights powered by advanced analytics
              and machine learning
            </p>
          </div>

          <div className="bg-white p-8 text-center">
            <div className="w-16 h-16 bg-section-bg flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-infina-green" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Easy to use
            </h3>
            <p className="text-muted-foreground">
              Clean, intuitive interface designed for everyone to manage their
              finances effortlessly
            </p>
          </div>

          <div className="bg-white p-8 text-center">
            <div className="w-16 h-16 bg-section-bg flex items-center justify-center mx-auto mb-6">
              <ArrowRight className="w-8 h-8 text-infina-orange" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Quick setup
            </h3>
            <p className="text-muted-foreground">
              Get up and running in minutes with our streamlined onboarding
              process
            </p>
          </div>
        </div>

        {/* Status Section */}
        <div className="bg-white p-8 mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Getting started
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-infina-blue text-white flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-foreground">
                  Connect your accounts
                </h4>
                <p className="text-muted-foreground">
                  Securely link your bank accounts and credit cards
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-infina-green text-white flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-foreground">
                  Set your goals
                </h4>
                <p className="text-muted-foreground">
                  Define your financial objectives and priorities
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-infina-orange text-white flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-foreground">
                  Track progress
                </h4>
                <p className="text-muted-foreground">
                  Monitor your financial health with real-time insights
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-section-bg p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of users who trust Infina PFA for their financial
            management
          </p>
          <button className="bg-infina-blue text-white px-8 py-4 font-medium text-lg hover:bg-opacity-90 transition-colors inline-flex items-center gap-2">
            Start your journey
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
}
