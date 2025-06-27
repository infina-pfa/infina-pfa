"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Shield, TrendingUp, Target, Brain } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-app-bg font-nunito">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-infina-blue relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-infina-blue to-blue-800" />

          <div className="relative z-10 flex flex-col justify-between p-12 text-white">
            {/* Top Section - Hero Content */}
            <div className="flex-1 flex flex-col justify-center max-w-lg">
              {/* Hero Image */}
              <div className="mb-8 text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-2xl overflow-hidden bg-white/10 p-2">
                  <Image
                    src="/auth/hero.png"
                    alt="Woman using Infina financial app"
                    width={120}
                    height={120}
                    className="w-full h-full object-cover rounded-xl"
                    priority
                  />
                </div>
              </div>

              <h1 className="text-4xl font-bold mb-4 leading-tight">
                {t("financialJourneyStarts")}
              </h1>

              <p className="text-xl text-blue-100 mb-10 leading-relaxed">
                {t("financialJourneyDescription")}
              </p>

              {/* Enhanced Features with Icons */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-infina-green/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <Brain className="w-5 h-5 text-infina-green" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {t("personalizedAdvice")}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      AI-powered insights tailored to your financial goals
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-infina-green/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <TrendingUp className="w-5 h-5 text-infina-green" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {t("smartRecommendations")}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      Data-driven suggestions to optimize your finances
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-infina-green/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <Target className="w-5 h-5 text-infina-green" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {t("planningTools")}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      Comprehensive tools for budgeting and goal tracking
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-infina-green/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-5 h-5 text-infina-green" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {t("securePlatform")}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      Bank-level security to protect your financial data
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Decorative Elements */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white opacity-5 rounded-full transform translate-x-36 -translate-y-36" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-5 rounded-full transform -translate-x-40 translate-y-40" />
          <div className="absolute top-1/2 right-0 w-32 h-32 bg-infina-green opacity-10 rounded-full transform translate-x-16" />
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo - Now visible on all screen sizes */}
            <div className="text-center mb-8">
              <Image
                src="/infina-logo.png"
                alt="Infina"
                width={150}
                height={45}
                className="mx-auto mb-2"
                priority
              />
              <p className="text-gray-600">{t("personalFinanceAssistant")}</p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
