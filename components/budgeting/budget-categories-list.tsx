"use client";

import { Plus, Zap, Home } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { BudgetCategoryCard } from "./budget-category-card";

// Mock data based on the UI documentation
const mockCategories = [
  {
    id: "1",
    name: "electricity",
    icon: <Zap className="h-6 w-6 text-[#FFC107]" />,
    spent: 0,
    budget: 200000,
    remaining: 200000,
  },
  {
    id: "2",
    name: "housing",
    icon: <Home className="h-6 w-6 text-[#0055FF]" />,
    spent: 0,
    budget: 3500000,
    remaining: 3500000,
  },
];

export const BudgetCategoriesList = () => {
  const { t } = useAppTranslation();

  return (
    <section className="mx-6">
      <div className="flex items-center justify-between px-6 py-4 bg-[#FFFFFF] rounded-t-xl">
        <h2 className="text-[18px] font-semibold text-[#111827] font-nunito leading-[24px]">
          {t("expenseCategories")}
        </h2>

        <Button
          variant="link"
          size="sm"
          className="text-[#0055FF] font-nunito hover:text-[#0041CC] cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("addNew")}
        </Button>
      </div>

      <div className="bg-[#FFFFFF] rounded-b-xl overflow-hidden">
        {mockCategories.map((category, index) => (
          <div key={category.id}>
            <BudgetCategoryCard
              id={category.id}
              name={t(category.name)}
              icon={category.icon}
              spent={category.spent}
              budget={category.budget}
              remaining={category.remaining}
            />
            {index < mockCategories.length - 1 && (
              <div className="h-px bg-[#E5E7EB] mx-6" />
            )}
          </div>
        ))}
      </div>

      {mockCategories.length === 0 && (
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
