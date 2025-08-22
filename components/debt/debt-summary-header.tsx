"use client";

import { Card } from "@/components/ui/card";
import { useAppTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface DebtSummaryData {
  totalAmount: number;
  nearestDueDate: Date | null;
}

interface DebtSummaryHeaderProps {
  summaryData: DebtSummaryData;
}

export function DebtSummaryHeader({ summaryData }: DebtSummaryHeaderProps) {
  const { t } = useAppTranslation(["debt"]);

  return (
    <Card className="p-6 bg-[#F0F2F5] border-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 font-nunito">
            {t("totalDebt")}
          </p>
          <p className="text-2xl font-bold text-[#0055FF] font-nunito">
            {formatCurrency(summaryData.totalAmount)}
          </p>
        </div>
        {summaryData.nearestDueDate && (
          <div>
            <p className="text-sm text-gray-600 font-nunito">
              {t("dueDate")}
            </p>
            <p className="text-2xl font-bold text-[#FF9800] font-nunito">
              {format(summaryData.nearestDueDate, "dd/MM/yyyy")}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}