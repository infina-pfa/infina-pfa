"use client";

import { useAuthContext } from "@/components/providers/auth-provider";
import { Header } from "@/components/ui/header";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Calculator, PieChart, TrendingUp, Target } from "lucide-react";

export default function ToolsPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/sign-in");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg font-nunito">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="w-8 h-8 border-2 border-infina-blue border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tools = [
    {
      title: "Budget Calculator",
      description: "Calculate your monthly budget and track expenses",
      icon: Calculator,
      color: "bg-infina-blue",
      comingSoon: true,
    },
    {
      title: "Expense Tracker",
      description: "Monitor your spending patterns and categories",
      icon: PieChart,
      color: "bg-infina-green",
      comingSoon: true,
    },
    {
      title: "Investment Planner",
      description: "Plan and track your investment portfolio",
      icon: TrendingUp,
      color: "bg-infina-orange",
      comingSoon: true,
    },
    {
      title: "Goal Tracker",
      description: "Set and monitor your financial goals",
      icon: Target,
      color: "bg-infina-yellow",
      comingSoon: true,
    },
  ];

  return (
    <div className="min-h-screen bg-app-bg font-nunito">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-nunito">
            {t("tools")}
          </h1>
          <p className="text-gray-600 font-nunito">
            Powerful financial tools to help you manage your money better
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool, index) => {
            const Icon = tool.icon;

            return (
              <div
                key={index}
                className="bg-white rounded-lg p-6 hover:shadow-sm transition-shadow border border-gray-100 relative"
              >
                {tool.comingSoon && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                )}

                <div
                  className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 font-nunito">
                  {tool.title}
                </h3>

                <p className="text-gray-600 text-sm font-nunito">
                  {tool.description}
                </p>

                <button
                  disabled={tool.comingSoon}
                  className={`
                    mt-4 w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors
                    ${
                      tool.comingSoon
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-infina-blue text-white hover:bg-blue-700"
                    }
                  `}
                >
                  {tool.comingSoon ? "Coming Soon" : "Launch Tool"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-lg p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 font-nunito">
            More Tools Coming Soon
          </h2>
          <p className="text-gray-600 font-nunito">
            We&apos;re constantly working on new financial tools to help you
            achieve your goals. Stay tuned for updates and new features that
            will make managing your finances even easier.
          </p>
        </div>
      </main>
    </div>
  );
}
