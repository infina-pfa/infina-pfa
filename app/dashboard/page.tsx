"use client";

import { BudgetList } from "@/components/budgets/budget-list";
import { useAuthContext } from "@/components/providers/auth-provider";
import { AppLayout } from "@/components/ui/app-layout";
import { FinancialOverview } from "@/components/dashboard";
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
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-2 border-infina-blue border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-nunito">
            {t("welcomeBack")}
          </h1>
          <p className="text-gray-600 font-nunito">{t("financialOverview")}</p>
        </div>

        {/* Financial Overview */}
        <div className="mb-8">
          <FinancialOverview />
        </div>

        {/* Budget List */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 font-nunito">
            {t("myBudgets")}
          </h2>
          <BudgetList />
        </div>
      </div>
    </AppLayout>
  );
}
