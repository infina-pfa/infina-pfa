"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";

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

          <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
            <div className="max-w-md text-center">
              {/* Logo/Brand */}
              <div className="mb-8">
                <Image
                  src="/infina-logo.png"
                  alt="Infina"
                  width={200}
                  height={60}
                  className="mx-auto mb-4"
                  priority
                />
                <div className="w-16 h-1 bg-white mx-auto rounded-full" />
              </div>

              {/* Hero Content */}
              <h2 className="text-3xl font-semibold mb-6 leading-tight">
                {t("financialJourneyStarts")}
              </h2>

              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                {t("financialJourneyDescription")}
              </p>

              {/* Features */}
              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-infina-green rounded-full" />
                  <span className="text-blue-100">
                    {t("personalizedAdvice")}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-infina-green rounded-full" />
                  <span className="text-blue-100">
                    {t("smartRecommendations")}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-infina-green rounded-full" />
                  <span className="text-blue-100">{t("planningTools")}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-infina-green rounded-full" />
                  <span className="text-blue-100">{t("securePlatform")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-32 -translate-y-32" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full transform -translate-x-48 translate-y-48" />
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
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
