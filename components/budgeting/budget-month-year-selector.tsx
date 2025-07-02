"use client";

import { useAppTranslation } from "@/hooks/use-translation";

interface BudgetMonthYearSelectorProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  validationErrors: { [key: string]: string };
  touched: { [key: string]: boolean };
}

export const BudgetMonthYearSelector = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  validationErrors,
  touched,
}: BudgetMonthYearSelectorProps) => {
  const { t, i18n } = useAppTranslation(["budgeting", "common"]);

  // Generate month options with current language
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    // Use current language from i18n, fallback to 'en' if not available
    const locale = i18n.language === "vi" ? "vi-VN" : "en-US";
    const monthName = new Date(2024, i, 1).toLocaleDateString(locale, {
      month: "long",
    });
    return { value: monthNum, label: monthName };
  });

  // Generate year options (current year + 5 years forward)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => {
    const year = currentYear + i;
    return { value: year, label: year.toString() };
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-[#111827]">
          {t("budgetMonth")}
        </label>
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(parseInt(e.target.value))}
          className="w-full h-12 px-3 bg-transparent border-0 border-b border-[#E5E7EB] focus:border-[#0055FF] focus:border-b-2 outline-none font-nunito text-[16px] text-[#111827]"
        >
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {validationErrors.month && touched.month && (
          <p className="text-sm text-[#F44336] flex items-center mt-1">
            <span className="mr-1">⚠</span>
            {validationErrors.month}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#111827]">
          {t("budgetYear")}
        </label>
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(parseInt(e.target.value))}
          className="w-full h-12 px-3 bg-transparent border-0 border-b border-[#E5E7EB] focus:border-[#0055FF] focus:border-b-2 outline-none font-nunito text-[16px] text-[#111827]"
        >
          {yearOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {validationErrors.year && touched.year && (
          <p className="text-sm text-[#F44336] flex items-center mt-1">
            <span className="mr-1">⚠</span>
            {validationErrors.year}
          </p>
        )}
      </div>
    </div>
  );
};
