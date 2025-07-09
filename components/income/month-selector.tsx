"use client";

import { useAppTranslation } from "@/hooks/use-translation";

interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
}

export function MonthSelector({
  selectedMonth,
  onMonthChange,
}: MonthSelectorProps) {
  const { t, i18n } = useAppTranslation(["income", "common"]);

  // Generate list of months (current month and 11 months back)
  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();

    for (let i = 0; i < 12; i++) {
      const month = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      months.push(month);
    }

    return months;
  };

  const monthOptions = generateMonthOptions();

  const formatMonthDisplay = (date: Date) => {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    if (i18n.language === "vi") {
      return `Tháng ${month}/${year}`;
    } else {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return `${monthNames[date.getMonth()]} ${year}`;
    }
  };

  const getMonthValue = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  };

  const handleMonthChange = (value: string) => {
    const [year, month] = value.split("-").map(Number);
    const newDate = new Date(year, month - 1, 1);
    onMonthChange(newDate);
  };

  return (
    <div>
      <label className="block text-[14px] font-bold text-[#111827] font-nunito mb-1">
        {t("selectMonth")}
      </label>
      <select
        value={getMonthValue(selectedMonth)}
        onChange={(e) => handleMonthChange(e.target.value)}
        className="w-full max-w-none md:max-w-[300px] h-12 md:h-12 px-3 bg-transparent border-0 border-b border-[#E5E7EB] focus:border-[#0055FF] focus:outline-none font-nunito text-[16px] md:text-[16px] cursor-pointer"
        style={{
          WebkitAppearance: "none",
          MozAppearance: "none",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 8px center",
          backgroundSize: "20px",
        }}
      >
        {monthOptions.map((month) => (
          <option key={getMonthValue(month)} value={getMonthValue(month)}>
            {formatMonthDisplay(month)}
          </option>
        ))}
      </select>
    </div>
  );
}
