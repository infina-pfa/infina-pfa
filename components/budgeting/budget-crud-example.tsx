"use client";

import React, { useState } from "react";
import { useBudgetList } from "@/hooks/use-budget-list";
import { useBudgetCreate } from "@/hooks/use-budget-create";
import { useBudgetUpdate } from "@/hooks/use-budget-update";
import { useBudgetDelete } from "@/hooks/use-budget-delete";
import { useBudgetStats } from "@/hooks/use-budget-stats";
import {
  CreateBudgetRequest,
  UpdateBudgetRequest,
  Budget,
} from "@/lib/types/budget.types";
import { useTranslation } from "react-i18next";

/**
 * Example component demonstrating budget CRUD operations
 * This shows how to use individual hooks following single responsibility principle
 */
export const BudgetCrudExample: React.FC = () => {
  const { t } = useTranslation();

  // Individual hooks for different operations
  const {
    budgets,
    loading: listLoading,
    error: listError,
    refetch,
  } = useBudgetList();
  const { createBudget, isCreating, error: createError } = useBudgetCreate();
  const { updateBudget, isUpdating, error: updateError } = useBudgetUpdate();
  const { deleteBudget, isDeleting, error: deleteError } = useBudgetDelete();
  const { stats, loading: statsLoading } = useBudgetStats();

  // Form state
  const [formData, setFormData] = useState<CreateBudgetRequest>({
    name: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    category: "general",
    color: "#0055FF",
    icon: "wallet",
  });

  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createBudget(formData);
    if (result) {
      setFormData({
        name: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        category: "general",
        color: "#0055FF",
        icon: "wallet",
      });
      refetch(); // Refresh the list
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget) return;

    const updateData: UpdateBudgetRequest = {
      name: formData.name,
      category: formData.category,
      color: formData.color,
      icon: formData.icon,
    };

    const result = await updateBudget(editingBudget.id, updateData);
    if (result) {
      setEditingBudget(null);
      refetch(); // Refresh the list
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t("budgeting.confirmDelete"))) {
      const success = await deleteBudget(id);
      if (success) {
        refetch(); // Refresh the list
      }
    }
  };

  const startEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      name: budget.name,
      month: budget.month,
      year: budget.year,
      category: budget.category || "general",
      color: budget.color || "#0055FF",
      icon: budget.icon || "wallet",
    });
  };

  if (listLoading) {
    return <div className="text-center py-8">{t("common.loading")}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Statistics Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {t("budgeting.statistics")}
        </h2>
        {statsLoading ? (
          <div>{t("common.loading")}</div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-[#0055FF]">
                {stats.totalBudgets}
              </div>
              <div className="text-sm text-gray-600">
                {t("budgeting.totalBudgets")}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-[#2ECC71]">
                {stats.categoriesCount}
              </div>
              <div className="text-sm text-gray-600">
                {t("budgeting.categoriesCount")}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-[#FF9800]">
                {stats.monthlyBudgets}
              </div>
              <div className="text-sm text-gray-600">
                {t("budgeting.monthlyBudgets")}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-[#F44336]">
                {stats.yearlyBudgets}
              </div>
              <div className="text-sm text-gray-600">
                {t("budgeting.yearlyBudgets")}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Create/Edit Form */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingBudget
            ? t("budgeting.editBudget")
            : t("budgeting.createBudget")}
        </h2>
        <form
          onSubmit={editingBudget ? handleUpdate : handleCreate}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("budgeting.budgetName")}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder={t("budgeting.enterBudgetName")}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("budgeting.budgetCategory")}
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="general">{t("budgeting.general")}</option>
                <option value="food">{t("budgeting.food")}</option>
                <option value="transportation">
                  {t("budgeting.transportation")}
                </option>
                <option value="shopping">{t("budgeting.shopping")}</option>
                <option value="entertainment">
                  {t("budgeting.entertainment")}
                </option>
                <option value="health">{t("budgeting.health")}</option>
                <option value="travel">{t("budgeting.travel")}</option>
                <option value="utilities">{t("budgeting.utilities")}</option>
                <option value="education">{t("budgeting.education")}</option>
                <option value="other">{t("budgeting.other")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("budgeting.budgetColor")}
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="w-full h-10 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {!editingBudget && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("budgeting.budgetMonth")}
                </label>
                <select
                  value={formData.month}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      month: parseInt(e.target.value),
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {new Date(0, month - 1).toLocaleString("default", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("budgeting.budgetYear")}
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                  min="2020"
                  max="2030"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="px-4 py-2 bg-[#0055FF] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isCreating || isUpdating
                ? t("common.saving")
                : editingBudget
                ? t("common.update")
                : t("common.create")}
            </button>

            {editingBudget && (
              <button
                type="button"
                onClick={() => setEditingBudget(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                {t("common.cancel")}
              </button>
            )}
          </div>
        </form>

        {/* Error Messages */}
        {(createError || updateError) && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {createError || updateError}
          </div>
        )}
      </div>

      {/* Budget List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {t("budgeting.budgetList")}
        </h2>

        {listError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {listError}
          </div>
        )}

        {budgets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t("budgeting.noBudgetsYet")}
          </div>
        ) : (
          <div className="grid gap-4">
            {budgets.map((budget) => (
              <div key={budget.id} className="bg-white p-4 rounded-lg border">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: budget.color }}
                    />
                    <div>
                      <h3 className="font-semibold">{budget.name}</h3>
                      <p className="text-sm text-gray-600">
                        {t(`budgeting.${budget.category}`) || budget.category} •
                        {budget.month}/{budget.year}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(budget)}
                      className="px-3 py-1 text-sm bg-[#FF9800] text-white rounded hover:bg-orange-600"
                    >
                      {t("common.edit")}
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      disabled={isDeleting}
                      className="px-3 py-1 text-sm bg-[#F44336] text-white rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      {t("common.delete")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {deleteError}
          </div>
        )}
      </div>
    </div>
  );
};
