"use client";

import { useEffect } from "react";
import { useBudgetAnalysis } from "@/hooks/use-budget-analysis";
import { BudgetSummary } from "./budget-summary";
import { useAppTranslation } from "@/hooks/use-translation";

interface BudgetAnalysisMessageProps {
  onAnalysisReady?: (message: string) => void;
}

export const BudgetAnalysisMessage = ({
  onAnalysisReady,
}: BudgetAnalysisMessageProps) => {
  const { t } = useAppTranslation(["chat", "common", "budgeting"]);

  const {
    analysis,
    loading: analysisLoading,
    analyzeBudget,
  } = useBudgetAnalysis();

  // Use effect to notify parent when analysis is ready
  useEffect(() => {
    if (analysis?.message && onAnalysisReady) {
      onAnalysisReady(analysis.message);
    }
  }, [analysis, onAnalysisReady]);

  const handleBudgetDataReady = async (budgetData: {
    totalBudget: number;
    totalSpent: number;
    remaining: number;
    spendingPercentage: number;
  }) => {
    if (!analysis && !analysisLoading) {
      await analyzeBudget(budgetData);
    }
  };

  return (
    <div className="mb-6">
      {/* AI Welcome Message */}
      {analysisLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 mr-2">
            <div className="w-full h-full bg-blue-600 rounded-full animate-pulse"></div>
          </div>
          <p className="text-gray-500 font-nunito text-sm">
            {t("analyzingFinances", { ns: "budgeting" })}
          </p>
        </div>
      ) : analysis ? (
        <div className="space-y-2">
          <div className="flex justify-start mb-6">
            <div className="flex max-w-[80%] flex-row items-start gap-4">
              <div className="flex flex-col items-start">
                <div className="px-4 py-3 rounded-2xl max-w-full font-nunito text-base bg-gray-100 text-gray-900 rounded-bl-sm">
                  <div>
                    <div className="text-left whitespace-pre-wrap break-words">
                      {analysis.message}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-2 font-nunito text-left">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>
          <BudgetSummary onDataReady={handleBudgetDataReady} />
        </div>
      ) : (
        <div className="hidden">
          {/* Hidden budget summary to load data */}
          <BudgetSummary onDataReady={handleBudgetDataReady} />
        </div>
      )}
    </div>
  );
};
