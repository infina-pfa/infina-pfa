"use client";

import { useState, useCallback, useMemo } from "react";
import {
  OnboardingComponent,
  ComponentResponse,
} from "@/lib/types/onboarding.types";
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
  const [isCompleted, setIsCompleted] = useState(
    !!component.response?.allocation
  );

  // Memoize context data to prevent recalculation on every render
  const contextData = useMemo(() => {
    const monthlyIncome = component.context?.monthlyIncome || 10000000; // Default 10M VND for demo
    const emergencyFundTarget = component.context?.emergencyFundTarget || monthlyIncome * 6; // Default 6 months of income
    const monthlyTargetSavings = component.context?.monthlyTargetSavings || emergencyFundTarget / 24; // 24 months to reach target
    const budgetingStyle = component.context?.budgetingStyle || "goal_focused";
    const expenseBreakdown = component.context?.expenseBreakdown || {};
    
    return {
      monthlyIncome,
      emergencyFundTarget,
      monthlyTargetSavings,
      budgetingStyle,
      expenseBreakdown
    };
  }, [component.context]);

  const { monthlyIncome, emergencyFundTarget, monthlyTargetSavings, budgetingStyle, expenseBreakdown } = contextData;

  // Debug logging for context data
  console.log("🔍 BudgetAllocationTool - Context data received:", {
    fullContext: component.context,
    monthlyIncome,
    emergencyFundTarget,
    monthlyTargetSavings,
    budgetingStyle,
    expenseBreakdown,
    hasExpenseBreakdown:
      !!expenseBreakdown && Object.keys(expenseBreakdown).length > 0,
    expenseBreakdownKeys: Object.keys(expenseBreakdown),
  });

  // Use the budget allocation hook
  const {
    allocation,
    validationErrors,
    totalPercentage,
    isValid,
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
    return (Math.round(value * 10) / 10).toString();
  }, []);

  // Memoize form props to prevent unnecessary re-renders
  const formProps = useMemo(() => ({
    monthlyIncome,
    allocation,
    validationErrors,
    totalPercentage,
    isValid,
    isSubmitting,
    isCompleted,
    budgetingStyle,
    expenseBreakdown,
    onPercentageChange: handlePercentageChange,
    onAutoAdjust: autoAdjustAllocation,
    formatCurrency,
    formatPercentage,
    calculateMonetaryValue,
  }), [
    monthlyIncome,
    allocation,
    validationErrors,
    totalPercentage,
    isValid,
    isSubmitting,
    isCompleted,
    budgetingStyle,
    expenseBreakdown,
    handlePercentageChange,
    autoAdjustAllocation,
    formatCurrency,
    formatPercentage,
    calculateMonetaryValue,
  ]);

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

      console.log("🏗️ Budget allocation tool submission context:", {
        fullContext: component.context,
        budgetingStyle,
        expenseBreakdown,
        hasExpenseBreakdown: !!expenseBreakdown,
        allocation,
        monthlyIncome,
        emergencyFundTarget,
        monthlyTargetSavings,
      });

      console.log("🏗️ Creating budget records from allocation:", {
        allocation,
        monthlyIncome,
        budgetingStyle,
        expenseBreakdown,
      });

      // Create budget records in database via service layer
      const allocationResult =
        await budgetAllocationService.createBudgetAllocation({
          allocationData: allocation,
          monthlyIncome,
          budgetingStyle,
          expenseBreakdown,
        });

      if (!allocationResult.success || !allocationResult.data) {
        throw new Error(
          allocationResult.error || "Failed to create budget records"
        );
      }

      console.log(
        "✅ Budget records created successfully:",
        allocationResult.data
      );

      await onResponse({
        allocation,
        monthlyIncome,
        monetaryValues,
        budgetsCreated: allocationResult.data.budgets,
        budgetingStyle,
        completedAt: new Date(),
        userMessage: t("budgetAllocationUserMessage", {
          ns: "onboarding",
          defaultValue: `Perfect! I've confirmed my budget allocation and the system has created ${
            allocationResult.data.totalBudgets
          } budget categories for me. Emergency Fund ${formatPercentage(
            allocation.emergencyFund
          )}% (${formatCurrency(
            monetaryValues.emergencyFund
          )}), Living Expenses ${formatPercentage(
            allocation.livingExpenses
          )}% (${formatCurrency(
            monetaryValues.livingExpenses
          )}), Free to Spend ${formatPercentage(
            allocation.freeToSpend
          )}% (${formatCurrency(monetaryValues.freeToSpend)}). This ${
            budgetingStyle === "goal_focused" ? "simplified" : "detailed"
          } approach matches my preference for financial tracking.`,
        }),
        allocationSummary: {
          total: formatCurrency(monthlyIncome),
          totalBudgets: allocationResult.data.totalBudgets,
          categories: [
            {
              name: t("emergencyFund", {
                ns: "budgeting",
                defaultValue: "Emergency Fund",
              }),
              percentage: `${formatPercentage(allocation.emergencyFund)}%`,
              amount: formatCurrency(monetaryValues.emergencyFund),
              priority: 1,
              locked: true,
            },
            {
              name: t("livingExpenses", {
                ns: "budgeting",
                defaultValue: "Living Expenses",
              }),
              percentage: `${formatPercentage(allocation.livingExpenses)}%`,
              amount: formatCurrency(monetaryValues.livingExpenses),
              priority: 2,
              locked: false,
            },
            {
              name: t("freeToSpend", {
                ns: "budgeting",
                defaultValue: "Free to Spend",
              }),
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
    budgetingStyle,
    expenseBreakdown,
    monthlyIncome,
    emergencyFundTarget,
    monthlyTargetSavings,
    formatCurrency,
    formatPercentage,
    onResponse,
    t,
    component.context,
  ]);

  return (
    <BudgetAllocationForm
      {...formProps}
      onSubmit={handleSubmit}
    />
  );
}
