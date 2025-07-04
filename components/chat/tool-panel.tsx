"use client";

import { useAppTranslation } from "@/hooks/use-translation";
import { ChatToolId } from "@/lib/types/ai-streaming.types";
import { useEffect, useState } from "react";
import { BudgetingWidget } from "../budgeting/budgeting-widget";
import { X } from "lucide-react";

interface ToolPanelProps {
  onClose: () => void;
  toolId: ChatToolId | null;
  isOpen?: boolean;
}

export function ToolPanel({ onClose, toolId, isOpen = false }: ToolPanelProps) {
  const { t } = useAppTranslation(["chat", "common"]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on client-side
    if (typeof window !== "undefined") {
      const checkIsMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      // Initial check
      checkIsMobile();

      // Add event listener for resize
      window.addEventListener("resize", checkIsMobile);

      // Cleanup
      return () => window.removeEventListener("resize", checkIsMobile);
    }
  }, []);

  if (!isOpen || !toolId) {
    return null;
  }

  const renderComponent = () => {
    switch (toolId) {
      case ChatToolId.BUDGET_TOOL:
        return <BudgetingWidget />;

      case ChatToolId.LOAN_CALCULATOR:
        return (
          <div className="bg-white p-6 rounded-xl">
            <h3 className="text-xl font-bold font-nunito mb-4 text-gray-900">
              {t("expenseTrackerTitle")}
            </h3>
            <p className="text-base text-gray-600 font-nunito mb-6">
              {t("expenseTrackerDescription")}
            </p>
            <div className="text-center py-12 text-gray-500 font-nunito">
              {t("componentPlaceholder")}
            </div>
          </div>
        );

      case ChatToolId.INTEREST_CALCULATOR:
        return (
          <div className="bg-white p-6 rounded-xl">
            <h3 className="text-xl font-bold font-nunito mb-4 text-gray-900">
              {t("goalPlannerTitle")}
            </h3>
            <p className="text-base text-gray-600 font-nunito mb-6">
              {t("goalPlannerDescription")}
            </p>
            <div className="text-center py-12 text-gray-500 font-nunito">
              {t("componentPlaceholder")}
            </div>
          </div>
        );

      case ChatToolId.SALARY_CALCULATOR:
        return (
          <div className="bg-white p-6 rounded-xl">
            <h3 className="text-xl font-bold font-nunito mb-4 text-gray-900">
              {t("investmentCalculatorTitle")}
            </h3>
            <p className="text-base text-gray-600 font-nunito mb-6">
              {t("investmentCalculatorDescription")}
            </p>
            <div className="text-center py-12 text-gray-500 font-nunito">
              {t("componentPlaceholder")}
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white p-6 rounded-xl">
            <h3 className="text-xl font-bold font-nunito mb-4 text-gray-900">
              {t("unknownComponentTitle")}
            </h3>
            <p className="text-base text-gray-600 font-nunito mb-6">
              {t("unknownComponentDescription")}
            </p>
            <div className="text-center py-12 text-gray-500 font-nunito">
              {t("componentPlaceholder")}
            </div>
          </div>
        );
    }
  };

  // Mobile: Full screen overlay
  if (isMobile) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-gray-50 rounded-xl w-full h-[100vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gray-100 rounded-t-xl">
            <h2 className="text-xl font-bold font-nunito text-gray-900">
              {t(toolId, { ns: "common" })}
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
              aria-label={t("closePanel")}
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex-col h-full overflow-y-auto">
            {renderComponent()}
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Split screen
  return (
    <div className="fixed md:relative inset-y-0 right-0 w-full md:w-1/2 lg:w-2/5 bg-gray-50 border-l border-gray-200 z-40 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-gray-100 border-b border-gray-200">
        <h2 className="text-xl font-bold font-nunito text-gray-900">
          {t("componentPanelTitle")}
        </h2>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
          aria-label={t("closePanel")}
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">{renderComponent()}</div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-4 p-6 bg-white border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-6 py-2 text-base font-nunito font-medium text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
        >
          {t("close")}
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white text-base font-nunito font-semibold rounded-full hover:bg-blue-700 transition-colors cursor-pointer">
          {t("useThisTool")}
        </button>
      </div>
    </div>
  );
}
