"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useAppTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/lib/utils";
import { Income, INCOME_CATEGORIES } from "@/lib/types/income.types";
import {
  DollarSignIcon,
  RepeatIcon,
  CalendarIcon,
  MoreVerticalIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface IncomeItemProps {
  income: Income;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export const IncomeItem = ({
  income,
  onEdit,
  onDelete,
  className = "",
}: IncomeItemProps) => {
  const { t } = useAppTranslation(["income", "common"]);

  // Extract category from description or default to "other"
  const getIncomeCategory = (description: string | null): string => {
    if (!description) return INCOME_CATEGORIES.OTHER;

    const desc = description.toLowerCase();
    for (const [, value] of Object.entries(INCOME_CATEGORIES)) {
      if (desc.includes(value.toLowerCase())) {
        return value;
      }
    }
    return INCOME_CATEGORIES.OTHER;
  };

  const category = getIncomeCategory(income.description);
  const isRecurring = income.recurring > 0;
  const formattedDate = new Date(income.created_at).toLocaleDateString();

  // Get category color
  const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      [INCOME_CATEGORIES.SALARY]: "#0055FF",
      [INCOME_CATEGORIES.FREELANCE]: "#2ECC71",
      [INCOME_CATEGORIES.INVESTMENT]: "#FF9800",
      [INCOME_CATEGORIES.BUSINESS]: "#9C27B0",
      [INCOME_CATEGORIES.BONUS]: "#FFC107",
      [INCOME_CATEGORIES.GIFT]: "#E91E63",
      [INCOME_CATEGORIES.OTHER]: "#6B7280",
    };
    return colorMap[category] || "#6B7280";
  };

  const categoryColor = getCategoryColor(category);

  // Get category icon
  const getCategoryIcon = () => {
    switch (category) {
      case INCOME_CATEGORIES.SALARY:
      case INCOME_CATEGORIES.FREELANCE:
      case INCOME_CATEGORIES.BUSINESS:
        return DollarSignIcon;
      default:
        return DollarSignIcon;
    }
  };

  const IconComponent = getCategoryIcon();

  return (
    <Card
      className={`bg-[#FFFFFF] hover:bg-[#F9FAFB] transition-colors duration-150 cursor-pointer ${className}`}
    >
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between gap-3">
          {/* Left side - Icon and info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Category Icon */}
            <div
              className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full"
              style={{ backgroundColor: `${categoryColor}20` }}
            >
              <IconComponent
                className="w-5 h-5 md:w-6 md:h-6"
                style={{ color: categoryColor }}
              />
            </div>

            {/* Income Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[14px] md:text-[16px] font-semibold text-[#111827] font-nunito leading-[20px] md:leading-[24px] truncate">
                  {income.name}
                </h3>
                {isRecurring && (
                  <RepeatIcon className="w-4 h-4 text-[#2ECC71] flex-shrink-0" />
                )}
              </div>

              <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-3">
                <p className="text-[12px] md:text-[14px] font-medium text-[#6B7280] font-nunito">
                  {t(category.toLowerCase(), { ns: "income" })}
                </p>
                <div className="hidden xs:block w-1 h-1 bg-[#E5E7EB] rounded-full"></div>
                <p className="text-[12px] md:text-[14px] text-[#6B7280] font-nunito flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {formattedDate}
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Amount and actions */}
          <div className="flex items-center gap-3">
            {/* Amount */}
            <div className="text-right">
              <p className="text-[16px] md:text-[18px] font-bold text-[#111827] font-nunito leading-[20px] md:leading-[24px]">
                {formatCurrency(income.amount)}
              </p>
              {isRecurring && (
                <p className="text-[10px] md:text-[12px] text-[#2ECC71] font-nunito">
                  {t("recurring", { ns: "income" })}
                </p>
              )}
            </div>

            {/* Actions Menu */}
            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
                  >
                    <MoreVerticalIcon className="w-4 h-4" />
                    <span className="sr-only">
                      {t("openMenu", { ns: "common" })}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="font-nunito">
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={() => onEdit(income.id)}
                      className="text-[14px] cursor-pointer"
                    >
                      {t("editIncome", { ns: "income" })}
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(income.id)}
                      className="text-[14px] cursor-pointer text-[#F44336] focus:text-[#F44336]"
                    >
                      {t("deleteIncome", { ns: "income" })}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Description (if exists) */}
        {income.description && (
          <div className="mt-3 md:mt-4 ml-13 md:ml-15">
            <p className="text-[12px] md:text-[14px] text-[#6B7280] font-nunito leading-[16px] md:leading-[20px]">
              {income.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
