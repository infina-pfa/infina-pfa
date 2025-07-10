"use client";

import { useAppTranslation } from "@/hooks/use-translation";
import { FinancialOverviewCard } from "./financial-overview-card";
import { MessageTimestamp } from "./message-timestamp";

interface FinancialOverviewMessageProps {
  month?: number;
  year?: number;
}

export const FinancialOverviewMessage = ({
  month,
  year,
}: FinancialOverviewMessageProps) => {
  const { t } = useAppTranslation(["chat", "common"]);
  const timestamp = new Date().toISOString();

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-start">
        <div className="flex max-w-[85%] flex-col items-start">
          <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-gray-100 text-gray-900">
            <p className="text-sm font-medium mb-2">
              {t("financialOverviewTitle", {
                ns: "chat",
                defaultValue: "Here's your financial overview:",
              })}
            </p>
            <div className="w-full max-w-md">
              <FinancialOverviewCard month={month} year={year} />
            </div>
          </div>
          <MessageTimestamp timestamp={timestamp} isUser={false} />
        </div>
      </div>
    </div>
  );
};
