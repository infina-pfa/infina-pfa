"use client";

import { Plus } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { BudgetCategoryCard } from "./budget-category-card";
import { BUDGET_ICONS } from "@/lib/utils/budget-constants";
import { BudgetWithSpending } from "@/lib/types/budget.types";

interface BudgetCategoriesListProps {
  budgets: BudgetWithSpending[];
  onCreateBudget?: () => void;
  onEditBudget?: (budgetId: string) => void;
  onAddExpense?: (budgetId: string) => void;
  onDeleteBudget?: (budgetId: string) => void;
}

export const BudgetCategoriesList = ({
  budgets,
  onCreateBudget,
  onEditBudget,
  onAddExpense,
  onDeleteBudget,
}: BudgetCategoriesListProps) => {
  const { t } = useAppTranslation("budgeting");

  return (
    <section className="mx-4 md:mx-6">
      <div className="flex items-center justify-between px-4 md:px-6 pt-4 bg-[#FFFFFF] rounded-t-xl">
        <h2 className="text-[16px] md:text-[18px] font-semibold text-[#111827] font-nunito leading-[20px] md:leading-[24px]">
          {t("expenseCategories")}
        </h2>

        <Button
          size="sm"
          onClick={onCreateBudget}
          className="h-9 md:h-10 text-sm md:px-4 rounded-full"
        >
          <Plus className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">{t("addNew")}</span>
        </Button>
      </div>

      <div className="bg-[#FFFFFF] rounded-b-xl overflow-hidden p-4 md:p-6">
        {budgets.map((budget, index) => {
          const iconInfo =
            BUDGET_ICONS.find((icon) => icon.name === budget.icon) ||
            BUDGET_ICONS[0];
          const IconComponent = iconInfo.icon;

          return (
            <div key={budget.id}>
              <BudgetCategoryCard
                id={budget.id}
                name={budget.name}
                icon={
                  <IconComponent
                    className="h-5 w-5 md:h-6 md:w-6"
                    style={{ color: budget.color || iconInfo.color }}
                  />
                }
                spent={budget.spent}
                budget={budget.amount}
                remaining={budget.remaining}
                color={budget.color}
                onEdit={onEditBudget}
                onAddExpense={onAddExpense}
                onDelete={onDeleteBudget}
              />
              {index < budgets.length - 1 && <div className="h-3 md:h-4" />}
            </div>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <div className="px-4 md:px-6 py-6 md:py-8 text-center bg-[#FFFFFF] rounded-xl">
          <p className="text-[#6B7280] font-nunito text-[14px] md:text-[16px] leading-[20px] md:leading-[24px]">
            {t("noBudgetsYet")}
          </p>
          <p className="text-[12px] md:text-[14px] text-[#6B7280] mt-2 font-nunito leading-[16px] md:leading-[20px]">
            {t("createFirstBudget")}
          </p>
        </div>
      )}
    </section>
  );
};
