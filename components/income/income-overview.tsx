"use client";

import { useAppTranslation } from "@/hooks/use-translation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface IncomeOverviewProps {
  totalMonthlyIncome?: number;
  totalIncomeThisMonth?: number;
  incomeSourcesCount?: number;
  onCreateIncome?: () => void;
}

export function IncomeOverview({
  totalMonthlyIncome = 0,
  totalIncomeThisMonth = 0,
  incomeSourcesCount = 0,
  onCreateIncome,
}: IncomeOverviewProps) {
  const { t } = useAppTranslation(["income", "common"]);

  const stats = [
    {
      title: t("totalMonthlyIncome"),
      value: formatCurrency(totalMonthlyIncome),
      icon: DollarSign,
      color: "text-[#2ECC71]",
      bgColor: "bg-[#2ECC71]/10",
    },
    {
      title: t("receivedThisMonth"),
      value: formatCurrency(totalIncomeThisMonth),
      icon: TrendingUp,
      color: "text-[#0055FF]",
      bgColor: "bg-[#0055FF]/10",
    },
    {
      title: t("incomeSources"),
      value: incomeSourcesCount.toString(),
      icon: Calendar,
      color: "text-[#FF9800]",
      bgColor: "bg-[#FF9800]/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] font-nunito">
            {t("incomeManagement")}
          </h1>
          <p className="text-[#6B7280] font-nunito mt-1">
            {t("trackAndManageYourIncome")}
          </p>
        </div>

        <Button
          onClick={onCreateIncome}
          className="bg-[#0055FF] hover:bg-[#0041CC] text-white font-nunito flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("addIncome")}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6 border-0 bg-white">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-[#6B7280] font-nunito text-sm">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-[#1A1A1A] font-nunito">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
