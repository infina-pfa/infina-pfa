"use client";

import { useAppTranslation } from "@/hooks/use-translation";
import { BUDGET_ICONS } from "@/lib/utils/budget-constants";

interface BudgetIconSelectorProps {
  selectedIcon: string;
  onIconChange: (icon: string) => void;
}

export const BudgetIconSelector = ({
  selectedIcon,
  onIconChange,
}: BudgetIconSelectorProps) => {
  const { t } = useAppTranslation("budgeting");

  return (
    <div>
      <label className="block text-sm font-medium text-[#111827]">
        {t("budgetIcon")}
      </label>
      <div className="grid grid-cols-6 gap-2 mt-1">
        {BUDGET_ICONS.map((iconItem) => {
          const IconComponent = iconItem.icon;
          const isSelected = selectedIcon === iconItem.name;
          return (
            <button
              key={iconItem.name}
              type="button"
              onClick={() => onIconChange(iconItem.name)}
              className={`
                h-12 w-12 rounded-lg flex items-center justify-center transition-colors
                ${
                  isSelected
                    ? "bg-[#0055FF] text-white"
                    : "bg-[#F9FAFB] text-[#6B7280] hover:bg-[#F0F2F5]"
                }
              `}
            >
              <IconComponent className="h-5 w-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
