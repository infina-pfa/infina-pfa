"use client";

import { useAuthContext } from "@/components/providers/auth-provider";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/ui/header";
import { User, CreditCard, TrendingUp, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {
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

  return (
    <div className="min-h-screen bg-app-bg font-nunito">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("welcomeBack")}
          </h1>
          <p className="text-gray-600">{t("financialOverview")}</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Account Balance */}
          <Card className="p-6 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-infina-blue bg-opacity-10 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-infina-blue" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("totalBalance")}</p>
                <p className="text-2xl font-bold text-gray-900">$12,345</p>
              </div>
            </div>
          </Card>

          {/* Monthly Growth */}
          <Card className="p-6 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-infina-green bg-opacity-10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-infina-green" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("monthlyGrowth")}</p>
                <p className="text-2xl font-bold text-infina-green">+8.2%</p>
              </div>
            </div>
          </Card>

          {/* Savings Goal */}
          <Card className="p-6 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-infina-orange bg-opacity-10 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-infina-orange" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("savingsGoal")}</p>
                <p className="text-2xl font-bold text-gray-900">73%</p>
              </div>
            </div>
          </Card>

          {/* Profile Score */}
          <Card className="p-6 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("profileScore")}</p>
                <p className="text-2xl font-bold text-purple-600">85</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 p-6 bg-white">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("recentActivity")}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">
                    {t("investmentPortfolio")}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t("updatedHoursAgo")}
                  </p>
                </div>
                <span className="text-infina-green font-medium">+$124.50</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">
                    {t("monthlyBudget")}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t("budgetReviewCompleted")}
                  </p>
                </div>
                <span className="text-gray-900 font-medium">$2,450</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">
                    {t("savingsGoal")}
                  </p>
                  <p className="text-sm text-gray-600">{t("emergencyFund")}</p>
                </div>
                <span className="text-infina-blue font-medium">73%</span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 bg-white">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("quickActions")}
            </h2>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <p className="font-medium text-gray-900">
                  {t("addTransaction")}
                </p>
                <p className="text-sm text-gray-600">
                  {t("addTransactionDesc")}
                </p>
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <p className="font-medium text-gray-900">{t("setBudget")}</p>
                <p className="text-sm text-gray-600">{t("setBudgetDesc")}</p>
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <p className="font-medium text-gray-900">
                  {t("investmentAdvice")}
                </p>
                <p className="text-sm text-gray-600">
                  {t("investmentAdviceDesc")}
                </p>
              </button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
