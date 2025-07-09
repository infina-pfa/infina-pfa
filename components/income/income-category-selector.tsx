"use client";

import { useAppTranslation } from "@/hooks/use-translation";
import { INCOME_CATEGORIES } from "@/lib/types/income.types";
import {
  DollarSignIcon,
  TrendingUpIcon,
  BriefcaseIcon,
  GiftIcon,
  AwardIcon,
  MoreHorizontalIcon,
} from "lucide-react";

interface IncomeCategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

export const IncomeCategorySelector = ({
  selectedCategory,
  onCategoryChange,
  className = "",
}: IncomeCategorySelectorProps) => {
  const { t } = useAppTranslation("income");

  // Define category options with icons and colors
  const categoryOptions = [
    {
      value: INCOME_CATEGORIES.SALARY,
      label: t("salary"),
      icon: DollarSignIcon,
      color: "#0055FF",
    },
    {
      value: INCOME_CATEGORIES.FREELANCE,
      label: t("freelance"),
      icon: BriefcaseIcon,
      color: "#2ECC71",
    },
    {
      value: INCOME_CATEGORIES.INVESTMENT,
      label: t("investment"),
      icon: TrendingUpIcon,
      color: "#FF9800",
    },
    {
      value: INCOME_CATEGORIES.BUSINESS,
      label: t("business"),
      icon: BriefcaseIcon,
      color: "#9C27B0",
    },
    {
      value: INCOME_CATEGORIES.BONUS,
      label: t("bonus"),
      icon: AwardIcon,
      color: "#FFC107",
    },
    {
      value: INCOME_CATEGORIES.GIFT,
      label: t("gift"),
      icon: GiftIcon,
      color: "#E91E63",
    },
    {
      value: INCOME_CATEGORIES.OTHER,
      label: t("other"),
      icon: MoreHorizontalIcon,
      color: "#6B7280",
    },
  ];

  return (
    <div className={className}>
      <label className="block text-[14px] font-bold text-[#111827] font-nunito mb-4">
        {t("incomeCategory")}
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {categoryOptions.map((category) => {
          const IconComponent = category.icon;
          const isSelected = selectedCategory === category.value;

          return (
            <button
              key={category.value}
              type="button"
              onClick={() => onCategoryChange(category.value)}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-150
                ${
                  isSelected
                    ? "bg-[#F9FAFB] ring-2 ring-[#0055FF]"
                    : "bg-[#FFFFFF] hover:bg-[#F9FAFB] border border-[#E5E7EB]"
                }
              `}
            >
              {/* Icon */}
              <div
                className={`
                  w-10 h-10 flex items-center justify-center rounded-full transition-all duration-150
                  ${isSelected ? "scale-110" : "scale-100"}
                `}
                style={{
                  backgroundColor: isSelected
                    ? category.color
                    : `${category.color}20`,
                }}
              >
                <IconComponent
                  className="w-5 h-5"
                  style={{
                    color: isSelected ? "#FFFFFF" : category.color,
                  }}
                />
              </div>

              {/* Label */}
              <span
                className={`
                  text-[12px] md:text-[14px] font-medium font-nunito text-center leading-[16px] md:leading-[20px]
                  ${isSelected ? "text-[#0055FF]" : "text-[#6B7280]"}
                `}
              >
                {category.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Help Text */}
      <p className="text-[12px] text-[#6B7280] font-nunito mt-3 leading-[16px]">
        {t("incomeCategoryHelpText", {
          defaultValue:
            "Select the category that best describes your income source",
        })}
      </p>
    </div>
  );
};
