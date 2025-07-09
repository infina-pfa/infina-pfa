"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useAppTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/lib/utils";
import { IncomeStats } from "@/lib/types/income.types";
import {
  TrendingUpIcon,
  CalendarIcon,
  RepeatIcon,
  DollarSignIcon,
  BarChart3Icon,
} from "lucide-react";

interface IncomeStatsCardProps {
  stats: IncomeStats | null;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export const IncomeStatsCard = ({
  stats,
  loading = false,
  error = null,
  className = "",
}: IncomeStatsCardProps) => {
  const { t } = useAppTranslation(["income", "common"]);

  if (loading) {
    return (
      <Card className={`bg-[#FFFFFF] ${className}`}>
        <CardContent className="p-4 md:p-6">
          <div className="animate-pulse">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[#E5E7EB] rounded-full"></div>
              <div className="h-6 bg-[#E5E7EB] rounded w-32"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-[#E5E7EB] rounded w-24"></div>
                  <div className="h-8 bg-[#E5E7EB] rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-[#FFFFFF] ${className}`}>
        <CardContent className="p-4 md:p-6">
          <div className="text-center">
            <BarChart3Icon className="w-12 h-12 text-[#6B7280] mx-auto mb-3" />
            <p className="text-[#F44336] font-nunito text-sm mb-2">{error}</p>
            <p className="text-[#6B7280] font-nunito text-xs">
              {t("statsWillAppearHere", {
                defaultValue: "Statistics will appear here when available",
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={`bg-[#FFFFFF] ${className}`}>
        <CardContent className="p-4 md:p-6">
          <div className="text-center">
            <BarChart3Icon className="w-12 h-12 text-[#6B7280] mx-auto mb-3" />
            <h3 className="text-[16px] font-semibold text-[#111827] font-nunito mb-2">
              {t("noStatsAvailable", {
                defaultValue: "No statistics available",
              })}
            </h3>
            <p className="text-[#6B7280] font-nunito text-sm">
              {t("addIncomeToSeeStats", {
                defaultValue: "Add some income records to see statistics",
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statsItems = [
    {
      label: t("monthlyTotal", { ns: "income" }),
      value: formatCurrency(stats.monthlyTotal),
      icon: CalendarIcon,
      color: "#0055FF",
    },
    {
      label: t("averageMonthly", { ns: "income" }),
      value: formatCurrency(stats.averageMonthly),
      icon: TrendingUpIcon,
      color: "#2ECC71",
    },
    {
      label: t("recurringTotal", { ns: "income" }),
      value: formatCurrency(stats.recurringTotal),
      icon: RepeatIcon,
      color: "#FF9800",
    },
    {
      label: t("oneTimeTotal", { ns: "income" }),
      value: formatCurrency(stats.oneTimeTotal),
      icon: DollarSignIcon,
      color: "#9C27B0",
    },
  ];

  return (
    <Card className={`bg-[#FFFFFF] ${className}`}>
      <CardContent className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0055FF20]">
            <BarChart3Icon className="w-5 h-5 text-[#0055FF]" />
          </div>
          <h3 className="text-[16px] md:text-[18px] font-semibold text-[#111827] font-nunito">
            {t("incomeStats", { defaultValue: "Income Statistics" })}
          </h3>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {statsItems.map((item, index) => {
            const IconComponent = item.icon;

            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg"
              >
                <div
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <IconComponent
                    className="w-4 h-4"
                    style={{ color: item.color }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[#6B7280] font-nunito leading-[16px]">
                    {item.label}
                  </p>
                  <p className="text-[14px] md:text-[16px] font-bold text-[#111827] font-nunito leading-[20px] md:leading-[24px] truncate">
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="border-t border-[#E5E7EB] pt-4">
          <div className="flex flex-col xs:flex-row xs:justify-between gap-2 text-sm">
            <div className="flex items-center gap-4">
              <span className="text-[#6B7280] font-nunito">
                {t("totalIncomes", { ns: "income" })}:
                <strong className="text-[#111827] ml-1">
                  {stats.totalIncomes}
                </strong>
              </span>
              <span className="text-[#6B7280] font-nunito">
                {t("categoriesCount", { ns: "income" })}:
                <strong className="text-[#111827] ml-1">
                  {stats.categoriesCount}
                </strong>
              </span>
            </div>

            <div className="text-[#6B7280] font-nunito">
              {t("yearlyTotal", { ns: "income" })}:
              <strong className="text-[#111827] ml-1">
                {formatCurrency(stats.yearlyTotal)}
              </strong>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
