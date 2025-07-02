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
}

export const BudgetCategoriesList = ({
  budgets,
  onCreateBudget,
  onEditBudget,
  onAddExpense,
}: BudgetCategoriesListProps) => {
  const { t } = useAppTranslation("budgeting");

  return (
    <section className="mx-6">
      <div className="flex items-center justify-between px-6 pt-4 bg-[#FFFFFF] rounded-t-xl">
        <h2 className="text-[18px] font-semibold text-[#111827] font-nunito leading-[24px]">
          {t("expenseCategories")}
        </h2>

        <Button size="sm" onClick={onCreateBudget}>
          <Plus className="h-4 w-4 mr-2" />
          {t("addNew")}
        </Button>
      </div>

      <div className="bg-[#FFFFFF] rounded-b-xl overflow-hidden p-6">
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
                    className="h-6 w-6"
                    style={{ color: budget.color || iconInfo.color }}
                  />
                }
                spent={budget.spent}
                budget={budget.amount}
                remaining={budget.remaining}
                color={budget.color}
                onEdit={onEditBudget}
                onAddExpense={onAddExpense}
              />
              {index < budgets.length - 1 && <div className="h-4" />}
            </div>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <div className="px-6 py-8 text-center bg-[#FFFFFF] rounded-xl">
          <p className="text-[#6B7280] font-nunito text-[16px] leading-[24px]">
            {t("noBudgetsYet")}
          </p>
          <p className="text-[14px] text-[#6B7280] mt-2 font-nunito leading-[20px]">
            {t("createFirstBudget")}
          </p>
        </div>
      )}
    </section>
  );
};
