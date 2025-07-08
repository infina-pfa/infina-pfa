"use client";

import { formatCurrency } from "@/lib/utils";
import { BUDGET_COLORS } from "@/lib/utils/budget-constants";
import { ExpenseActionsMenu } from "./expense-actions-menu";
import { useAppTranslation } from "@/hooks/use-translation";

interface ExpenseItemProps {
  id: string;
  name: string;
  amount: number;
  date: string;
  category?: string;
  budgetName?: string;
  budgetColor?: string;
  description?: string | null;
  onEdit?: (expense: {
    id: string;
    name: string;
    amount: number;
    date: string;
    description?: string | null;
    budgetName?: string;
  }) => void;
  onDelete?: (id: string) => void;
}

export const ExpenseItem = ({
  id,
  name,
  amount,
  date,
  budgetName,
  budgetColor = BUDGET_COLORS[0],
  description,
  onEdit,
  onDelete,
}: ExpenseItemProps) => {
  const { t } = useAppTranslation(["budgeting"]);
  const handleEdit = () => {
    onEdit?.({
      id,
      name,
      amount,
      date,
      description,
      budgetName,
    });
  };

  const handleDelete = (expenseId: string) => {
    onDelete?.(expenseId);
  };

  return (
    <div
      className="p-3 md:p-6 bg-[#FFFFFF] rounded-md active:bg-[#F0F2F5] transition-colors duration-150"
      tabIndex={0}
      role="button"
      aria-label={t("expenseItemAriaLabel", {
        name,
        amount: formatCurrency(amount),
      })}
    >
      {/* Mobile: Stack layout, Desktop: Side-by-side */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Title and Actions Row on Mobile */}
          <div className="flex items-start justify-between gap-2 mb-1.5 md:mb-2">
            <h3 className="text-[14px] md:text-[16px] font-semibold text-[#111827] font-nunito leading-[20px] md:leading-[24px] flex-1 pr-2 line-clamp-2">
              {name}
            </h3>

            {/* Actions Menu - Visible on mobile, hidden on desktop (will be shown in amount section) */}
            <div className="md:hidden">
              <ExpenseActionsMenu
                id={id}
                onEdit={onEdit ? handleEdit : undefined}
                onDelete={onDelete ? handleDelete : undefined}
              />
            </div>
          </div>

          {/* Budget Category */}
          {budgetName && (
            <div className="mb-1.5 md:mb-0">
              <p
                className="text-[12px] md:text-[14px] font-medium font-nunito leading-[16px] md:leading-[20px] inline-block px-2 py-0.5 rounded-md max-w-[200px] truncate"
                style={{
                  color: budgetColor,
                  backgroundColor: `${budgetColor}20`, // 20% opacity
                }}
              >
                {budgetName}
              </p>
            </div>
          )}
        </div>

        {/* Amount and Date Section */}
        <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4 mt-1 md:mt-0">
          <div className="text-left md:text-right">
            <p className="text-[16px] md:text-[20px] font-semibold text-[#111827] font-nunito leading-[20px] md:leading-[28px]">
              {formatCurrency(amount)}
            </p>
            <p className="text-[12px] md:text-[14px] text-[#6B7280] font-nunito leading-[16px] md:leading-[20px] mt-0.5">
              {date}
            </p>
          </div>

          {/* Actions Menu - Hidden on mobile, visible on desktop */}
          <div className="hidden md:block">
            <ExpenseActionsMenu
              id={id}
              onEdit={onEdit ? handleEdit : undefined}
              onDelete={onDelete ? handleDelete : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
