"use client";

import { useState, useCallback } from "react";
import { OnboardingComponent, ComponentResponse } from "@/lib/types/onboarding.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { useBudgetAllocation } from "@/hooks/budgeting/use-budget-allocation";
import { BudgetAllocationForm } from "./budget-allocation-form";
import { budgetAllocationService } from "@/lib/services/budget-allocation.service";

interface BudgetAllocationToolProps {
  component: OnboardingComponent;
  onResponse: (response: ComponentResponse) => Promise<void>;
}

/**
 * Refactored Budget Allocation Tool
 * 
 * This component has been refactored to follow SOLID principles:
 * - Logic moved to useBudgetAllocation hook
 * - UI separated into BudgetAllocationForm component
 * - Individual category cards extracted to BudgetCategoryCard
 * 
 * This makes the code more maintainable and testable.
 */
export default function BudgetAllocationToolRefactored({
  component,
  onResponse,
}: BudgetAllocationToolProps) {
  const { t } = useAppTranslation(["onboarding", "budgeting", "common"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(!!component.response?.allocation);

  // Get data from component context (should be passed from previous steps)
  const monthlyIncome = component.context?.monthlyIncome || 10000000; // Default 10M VND for demo
  const emergencyFundTarget = component.context?.emergencyFundTarget || monthlyIncome * 6; // Default 6 months of income
  const monthlyTargetSavings = component.context?.monthlyTargetSavings || emergencyFundTarget / 24; // 24 months to reach target
  const budgetingStyle = component.context?.budgetingStyle || "goal_focused";
  const expenseBreakdown = component.context?.expenseBreakdown || {};

  // Debug logging for context data
  console.log("🔍 BudgetAllocationTool - Context data received:", {
    fullContext: component.context,
    monthlyIncome,
    emergencyFundTarget,
    monthlyTargetSavings,
    budgetingStyle,
    expenseBreakdown,
    hasExpenseBreakdown: !!expenseBreakdown && Object.keys(expenseBreakdown).length > 0,
    expenseBreakdownKeys: Object.keys(expenseBreakdown),
  });

  // Use the budget allocation hook
  const {
    allocation,
    validationErrors,
    totalPercentage,
    isValid,
    updateAllocation,
    handlePercentageChange,
    autoAdjustAllocation,
    calculateMonetaryValue,
  } = useBudgetAllocation({
    monthlyIncome,
    emergencyFundTarget,
    monthlyTargetSavings,
    budgetingStyle,
    expenseBreakdown,
    initialAllocation: component.response?.allocation,
  });

  // Format currency
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }, []);

  // Format percentage
  const formatPercentage = useCallback((value: number) => {
    return Math.round(value * 10) / 10;
  }, []);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (isSubmitting || isCompleted) return;

    const errors = validationErrors;
    if (errors.length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      const monetaryValues = {
        emergencyFund: calculateMonetaryValue(allocation.emergencyFund),
        livingExpenses: calculateMonetaryValue(allocation.livingExpenses),
        freeToSpend: calculateMonetaryValue(allocation.freeToSpend),
      };

      // Get user's budgeting style and expense breakdown from context
      const contextBudgetingStyle = component.context?.budgetingStyle || "goal_focused";
      const contextExpenseBreakdown = component.context?.expenseBreakdown || null;

      console.log("🏗️ Budget allocation tool submission context:", {
        fullContext: component.context,
        budgetingStyle: contextBudgetingStyle,
        expenseBreakdown: contextExpenseBreakdown,
        hasExpenseBreakdown: !!contextExpenseBreakdown,
        allocation,
        monthlyIncome,
        emergencyFundTarget,
        monthlyTargetSavings,
      });

      console.log("🏗️ Creating budget records from allocation:", {
        allocation,
        monthlyIncome,
        budgetingStyle: contextBudgetingStyle,
        expenseBreakdown: contextExpenseBreakdown,
      });

      // Create budget records in database via service layer
      const allocationResult = await budgetAllocationService.createBudgetAllocation({
        allocationData: allocation,
        monthlyIncome,
        budgetingStyle: contextBudgetingStyle,
        expenseBreakdown: contextExpenseBreakdown,
      });

      if (!allocationResult.success) {
        throw new Error(allocationResult.error || "Failed to create budget records");
      }

      console.log("✅ Budget records created successfully:", allocationResult.data);

      await onResponse({
        allocation,
        monthlyIncome,
        monetaryValues,
        budgetsCreated: allocationResult.data.budgets,
        budgetingStyle: contextBudgetingStyle,
        completedAt: new Date(),
        userMessage: t("budgetAllocationUserMessage", {
          ns: "onboarding",
          defaultValue: `Perfect! I've confirmed my budget allocation and the system has created ${
            allocationResult.data.totalBudgets
          } budget categories for me. Emergency Fund ${formatPercentage(
            allocation.emergencyFund
          )}% (${formatCurrency(monetaryValues.emergencyFund)}), Living Expenses ${formatPercentage(
            allocation.livingExpenses
          )}% (${formatCurrency(monetaryValues.livingExpenses)}), Free to Spend ${formatPercentage(
            allocation.freeToSpend
          )}% (${formatCurrency(monetaryValues.freeToSpend)}). This ${
            contextBudgetingStyle === "goal_focused" ? "simplified" : "detailed"
          } approach matches my preference for financial tracking.`,
        }),
        allocationSummary: {
          total: formatCurrency(monthlyIncome),
          totalBudgets: allocationResult.data.totalBudgets,
          categories: [
            {
              name: t("emergencyFund", { ns: "budgeting", defaultValue: "Emergency Fund" }),
              percentage: `${formatPercentage(allocation.emergencyFund)}%`,
              amount: formatCurrency(monetaryValues.emergencyFund),
              priority: 1,
              locked: true,
            },
            {
              name: t("livingExpenses", { ns: "budgeting", defaultValue: "Living Expenses" }),
              percentage: `${formatPercentage(allocation.livingExpenses)}%`,
              amount: formatCurrency(monetaryValues.livingExpenses),
              priority: 2,
              locked: false,
            },
            {
              name: t("freeToSpend", { ns: "budgeting", defaultValue: "Free to Spend" }),
              percentage: `${formatPercentage(allocation.freeToSpend)}%`,
              amount: formatCurrency(monetaryValues.freeToSpend),
              priority: 3,
              locked: false,
            },
          ],
        },
      });
      setIsCompleted(true);
    } catch (error) {
      console.error("Error submitting budget allocation:", error);
      // Error will be displayed through validationErrors
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    isCompleted,
    validationErrors,
    allocation,
    calculateMonetaryValue,
    component.context,
    monthlyIncome,
    emergencyFundTarget,
    monthlyTargetSavings,
    formatCurrency,
    formatPercentage,
    onResponse,
    t,
  ]);

  return (
    <BudgetAllocationForm
      monthlyIncome={monthlyIncome}
      allocation={allocation}
      validationErrors={validationErrors}
      totalPercentage={totalPercentage}
      isValid={isValid}
      isSubmitting={isSubmitting}
      isCompleted={isCompleted}
      budgetingStyle={budgetingStyle}
      expenseBreakdown={expenseBreakdown}
      onPercentageChange={handlePercentageChange}
      onAutoAdjust={autoAdjustAllocation}
      onSubmit={handleSubmit}
      formatCurrency={formatCurrency}
      formatPercentage={formatPercentage}
      calculateMonetaryValue={calculateMonetaryValue}
    />
  );
}