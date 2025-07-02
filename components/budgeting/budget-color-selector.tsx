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
      <label className="block text-sm font-medium text-[#111827]">
        {t("budgetColor")}
      </label>
      <div className="flex flex-wrap gap-3 mt-2">
        {BUDGET_COLORS.map((color) => {
          const isSelected = selectedColor === color;
          return (
            <button
              key={color}
              type="button"
              onClick={() => onColorChange(color)}
              className={`
                h-10 w-10 rounded-lg flex items-center justify-center transition-all
                ${
                  isSelected
                    ? "ring-2 ring-[#0055FF] ring-offset-2 scale-110 shadow-md"
                    : "hover:scale-105"
                }
              `}
              style={{ backgroundColor: color }}
            >
              {isSelected && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
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
