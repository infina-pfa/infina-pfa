"use client";

import { useAppTranslation } from "@/hooks/use-translation";
import { BUDGET_COLORS } from "@/lib/utils/budget-constants";

interface BudgetColorSelectorProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export const BudgetColorSelector = ({
  selectedColor,
  onColorChange,
}: BudgetColorSelectorProps) => {
  const { t } = useAppTranslation("budgeting");

  return (
    <div>
      <label className="block text-sm font-medium text-[#111827] mb-2">
        {t("budgetColor")}
      </label>
      <div className="flex flex-wrap gap-2 md:gap-3">
        {BUDGET_COLORS.map((color) => {
          const isSelected = selectedColor === color;
          return (
            <button
              key={color}
              type="button"
              onClick={() => onColorChange(color)}
              className={`
                h-9 w-9 md:h-10 md:w-10 rounded-lg flex items-center justify-center transition-all touch-manipulation
                ${
                  isSelected
                    ? "ring-2 ring-[#0055FF] ring-offset-2 scale-110"
                    : "hover:scale-105 active:scale-95"
                }
              `}
              style={{ backgroundColor: color }}
            >
              {isSelected && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="md:w-4 md:h-4"
                >
                  <path
                    d="M13.3334 4.66667L6.00002 12L2.66669 8.66667"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
      <input type="hidden" name="color" value={selectedColor} />
    </div>
  );
};
