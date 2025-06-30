"use client";

import { useTranslation } from "react-i18next";
import { ComponentData } from "@/lib/types/chat.types";

interface ComponentPanelProps {
  onClose: () => void;
  component?: ComponentData;
  isOpen?: boolean;
}

export function ComponentPanel({
  onClose,
  component,
  isOpen = false,
}: ComponentPanelProps) {
  const { t } = useTranslation("chat");

  if (!isOpen || !component) {
    return null;
  }

  const renderComponent = () => {
    switch (component.type) {
      case "budget_form":
        return (
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold font-nunito mb-4 text-gray-900">
              {component.title || t("budgetFormTitle")}
            </h3>
            <p className="text-sm text-gray-600 font-nunito mb-4">
              {component.description || t("budgetFormDescription")}
            </p>
            <div className="text-center py-8 text-gray-500 font-nunito">
              {t("componentPlaceholder")}
            </div>
          </div>
        );

      case "expense_tracker":
        return (
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold font-nunito mb-4 text-gray-900">
              {component.title || t("expenseTrackerTitle")}
            </h3>
            <p className="text-sm text-gray-600 font-nunito mb-4">
              {component.description || t("expenseTrackerDescription")}
            </p>
            <div className="text-center py-8 text-gray-500 font-nunito">
              {t("componentPlaceholder")}
            </div>
          </div>
        );

      case "goal_planner":
        return (
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold font-nunito mb-4 text-gray-900">
              {component.title || t("goalPlannerTitle")}
            </h3>
            <p className="text-sm text-gray-600 font-nunito mb-4">
              {component.description || t("goalPlannerDescription")}
            </p>
            <div className="text-center py-8 text-gray-500 font-nunito">
              {t("componentPlaceholder")}
            </div>
          </div>
        );

      case "investment_calculator":
        return (
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold font-nunito mb-4 text-gray-900">
              {component.title || t("investmentCalculatorTitle")}
            </h3>
            <p className="text-sm text-gray-600 font-nunito mb-4">
              {component.description || t("investmentCalculatorDescription")}
            </p>
            <div className="text-center py-8 text-gray-500 font-nunito">
              {t("componentPlaceholder")}
            </div>
          </div>
        );

      case "spending_chart":
        return (
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold font-nunito mb-4 text-gray-900">
              {component.title || t("spendingChartTitle")}
            </h3>
            <p className="text-sm text-gray-600 font-nunito mb-4">
              {component.description || t("spendingChartDescription")}
            </p>
            <div className="text-center py-8 text-gray-500 font-nunito">
              {t("componentPlaceholder")}
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold font-nunito mb-4 text-gray-900">
              {component.title || t("unknownComponentTitle")}
            </h3>
            <p className="text-sm text-gray-600 font-nunito mb-4">
              {component.description || t("unknownComponentDescription")}
            </p>
            <div className="text-center py-8 text-gray-500 font-nunito">
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
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold font-nunito text-gray-900">
            {t("componentPanelTitle")}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
            aria-label={t("closePanel")}
          >
            <svg
              className="w-5 h-5 text-gray-600"
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
        <div className="p-4">{renderComponent()}</div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-white rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-nunito text-gray-600 hover:text-gray-800 transition-colors"
          >
            {t("close")}
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-nunito rounded-lg hover:bg-blue-700 transition-colors">
            {t("useThisTool")}
          </button>
        </div>
      </div>
    </div>
  );
}
