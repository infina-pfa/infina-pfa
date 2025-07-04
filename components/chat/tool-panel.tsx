"use client";

import { useAppTranslation } from "@/hooks/use-translation";
import { ChatToolId } from "@/lib/types/ai-streaming.types";

interface ToolPanelProps {
  onClose: () => void;
  toolId: ChatToolId | null;
  isOpen?: boolean;
}

export function ToolPanel({ onClose, toolId, isOpen = false }: ToolPanelProps) {
  const { t } = useAppTranslation(["chat", "common"]);

  if (!isOpen || !toolId) {
    return null;
  }

  const renderComponent = () => {
    switch (toolId) {
      case ChatToolId.BUDGET_TOOL:
        return (
          <div className="bg-white p-6 rounded-xl">
            <h3 className="text-xl font-bold font-nunito mb-4 text-gray-900">
              {t("budgetFormTitle")}
            </h3>
            <p className="text-base text-gray-600 font-nunito mb-6">
              {t("budgetFormDescription")}
            </p>
            <div className="text-center py-12 text-gray-500 font-nunito">
              {t("componentPlaceholder")}
            </div>
          </div>
        );

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gray-100 rounded-t-xl">
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
        <div className="flex items-center justify-end gap-4 p-6 bg-white rounded-b-xl">
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
    </div>
  );
}
