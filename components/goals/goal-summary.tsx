"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useAppTranslation } from "@/hooks/use-translation";

interface GoalSummaryProps {
  totalCurrentAmount: number;
}

export function GoalSummary({ totalCurrentAmount }: GoalSummaryProps) {
  const { t } = useAppTranslation(["goals"]);

  return (
    <Card className="mb-6 p-6">
      <h2 className="text-xl font-semibold mb-4">
        {t("goals:goalsSummaryTitle")}
      </h2>
      <div className="p-4 bg-[#F0F2F5] rounded-lg">
        <h3 className="text-sm text-gray-600 mb-1">
          {t("goals:currentAmount")}
        </h3>
        <p className="text-2xl font-bold">
          {formatCurrency(totalCurrentAmount)}
        </p>
      </div>
    </Card>
  );
}
