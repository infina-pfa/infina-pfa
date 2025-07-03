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
      <label className="block text-sm font-medium text-[#111827] mb-2">
        {t("budgetIcon")}
      </label>
      {/* Responsive grid: 4 columns on mobile, 6 on tablet/desktop */}
      <div className="grid grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
        {BUDGET_ICONS.map((iconItem) => {
          const IconComponent = iconItem.icon;
          const isSelected = selectedIcon === iconItem.name;
          return (
            <button
              key={iconItem.name}
              type="button"
              onClick={() => onIconChange(iconItem.name)}
              className={`
                h-11 w-11 md:h-12 md:w-12 rounded-lg flex items-center justify-center transition-colors touch-manipulation
                ${
                  isSelected
                    ? "bg-[#0055FF] text-white"
                    : "bg-[#F9FAFB] text-[#6B7280] hover:bg-[#F0F2F5] active:bg-[#E5E7EB]"
                }
              `}
            >
              <IconComponent className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
