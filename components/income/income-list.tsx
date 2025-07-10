"use client";

import { useState } from "react";
import { useAppTranslation } from "@/hooks/use-translation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { IncomeItem } from "./income-item";
import { Search, Filter, Plus } from "lucide-react";
import { Income, INCOME_CATEGORIES } from "@/lib/types/income.types";

interface IncomeListProps {
  incomes?: Income[];
  onCreateIncome?: () => void;
  onEditIncome?: (incomeId: string) => void;
  onDeleteIncome?: (incomeId: string) => void;
}

// Mock data for demonstration
const mockIncomes: Income[] = [
  {
    id: "1",
    user_id: "user-1",
    name: "Software Engineer Salary",
    amount: 8000,
    type: "income",
    description: INCOME_CATEGORIES.SALARY,
    recurring: 30, // Monthly
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    user_id: "user-1",
    name: "Freelance Projects",
    amount: 2500,
    type: "income",
    description: INCOME_CATEGORIES.FREELANCE,
    recurring: 30, // Monthly
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "3",
    user_id: "user-1",
    name: "Rental Income",
    amount: 1200,
    type: "income",
    description: INCOME_CATEGORIES.INVESTMENT,
    recurring: 30, // Monthly
    created_at: "2023-12-01T00:00:00Z",
    updated_at: "2023-12-01T00:00:00Z",
  },
];

export function IncomeList({
  incomes = mockIncomes,
  onCreateIncome,
  onEditIncome,
  onDeleteIncome,
}: IncomeListProps) {
  const { t } = useAppTranslation(["income", "common"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterFrequency, setFilterFrequency] = useState<string>("all");

  // Filter incomes based on search and filters
  const filteredIncomes = incomes.filter((income) => {
    const matchesSearch =
      income.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      income.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || income.description === filterCategory;
    const matchesFrequency =
      filterFrequency === "all" ||
      (income.recurring || 0).toString() === filterFrequency;

    return matchesSearch && matchesCategory && matchesFrequency;
  });

  return (
    <Card className="p-6 border-0 bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A] font-nunito">
            {t("incomeSourcesTitle")}
          </h2>
          <p className="text-[#6B7280] font-nunito text-sm">
            {t("manageYourIncomeSources", { count: filteredIncomes.length })}
          </p>
        </div>

        <Button
          onClick={onCreateIncome}
          className="bg-[#0055FF] hover:bg-[#0041CC] text-white font-nunito flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("addNewIncome")}
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
          <Input
            placeholder={t("searchIncome")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-[#E5E7EB] focus:ring-[#0055FF] focus:border-[#0055FF]"
          />
        </div>

        {/* Category Filter */}
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <option value="all">{t("allCategories")}</option>
          <option value={INCOME_CATEGORIES.SALARY}>{t("salary")}</option>
          <option value={INCOME_CATEGORIES.FREELANCE}>{t("freelance")}</option>
          <option value={INCOME_CATEGORIES.BUSINESS}>{t("business")}</option>
          <option value={INCOME_CATEGORIES.INVESTMENT}>
            {t("investment")}
          </option>
          <option value={INCOME_CATEGORIES.OTHER}>{t("other")}</option>
        </Select>

        {/* Frequency Filter */}
        <Select value={filterFrequency} onValueChange={setFilterFrequency}>
          <option value="all">{t("allFrequencies")}</option>
          <option value="7">{t("weekly")}</option>
          <option value="14">{t("biweekly")}</option>
          <option value="30">{t("monthly")}</option>
          <option value="90">{t("quarterly")}</option>
          <option value="365">{t("yearly")}</option>
          <option value="0">{t("oneTime")}</option>
        </Select>
      </div>

      {/* Income List */}
      <div className="space-y-4">
        {filteredIncomes.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#F0F2F5] rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-6 w-6 text-[#6B7280]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A1A] font-nunito mb-2">
              {searchTerm ||
              filterCategory !== "all" ||
              filterFrequency !== "all"
                ? t("noIncomeSourcesFound")
                : t("noIncomeSourcesYet")}
            </h3>
            <p className="text-[#6B7280] font-nunito mb-4">
              {searchTerm ||
              filterCategory !== "all" ||
              filterFrequency !== "all"
                ? t("tryAdjustingFilters")
                : t("getStartedByAddingIncome")}
            </p>
            {!searchTerm &&
              filterCategory === "all" &&
              filterFrequency === "all" && (
                <Button
                  onClick={onCreateIncome}
                  className="bg-[#0055FF] hover:bg-[#0041CC] text-white font-nunito"
                >
                  {t("addFirstIncome")}
                </Button>
              )}
          </div>
        ) : (
          filteredIncomes.map((income) => (
            <IncomeItem
              key={income.id}
              income={income}
              onEdit={() => onEditIncome?.(income.id)}
              onDelete={() => onDeleteIncome?.(income.id)}
            />
          ))
        )}
      </div>
    </Card>
  );
}
