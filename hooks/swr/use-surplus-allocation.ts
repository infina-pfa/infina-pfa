"use client";

import useSWR from "swr";
import { budgetService } from "@/lib/services/budget.service";
import { goalService } from "@/lib/services/goal.service";
import { useAppTranslation } from "@/hooks/use-translation";
import { useState } from "react";

interface SurplusAllocationData {
  surplusAmount: number;
  currentEmergencyFund: number;
  allocationAmount: number;
  newEmergencyFundTotal: number;
  newMonthsOfCoverage: number;
  progressImpact: number; // percentage points gained
  hasSurplus: boolean;
  emergencyFundGoal: {
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
  } | null;
}

interface UseSurplusAllocationSWRReturn {
  data: SurplusAllocationData | null;
  loading: boolean;
  error: string | null;
  allocationAmount: number;
  setAllocationAmount: (amount: number) => void;
  allocateToEmergencyFund: () => Promise<boolean>;
  isAllocating: boolean;
  refetch: () => Promise<void>;
}

export function useSurplusAllocationSWR(): UseSurplusAllocationSWRReturn {
  const { t } = useAppTranslation(["common"]);
  const [allocationAmount, setAllocationAmount] = useState(0);
  const [isAllocating, setIsAllocating] = useState(false);

  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const { data, error, isLoading, mutate } = useSWR(
    ["surplus-allocation", currentMonth, currentYear],
    async () => {
      // Fetch current month budgets to calculate surplus
      const budgetsResponse = await budgetService.getAllWithSpending(
        { month: currentMonth, year: currentYear },
        t
      );
      
      if (budgetsResponse.error) {
        throw new Error(budgetsResponse.error);
      }

      // Fetch emergency fund goal
      const goalsResponse = await goalService.getAllWithTransactions({}, t);
      if (goalsResponse.error) {
        throw new Error(goalsResponse.error);
      }

      const totalBudget = budgetsResponse.totalBudget || 0;
      const totalSpent = budgetsResponse.totalSpent || 0;
      
      // Calculate surplus (only if spending is less than budget)
      const surplusAmount = totalBudget > totalSpent ? totalBudget - totalSpent : 0;
      const hasSurplus = surplusAmount > 0;

      // Find emergency fund goal
      const emergencyFundGoal = goalsResponse.goals?.find(
        goal => 
          goal.title.toLowerCase().includes("emergency") ||
          goal.title.toLowerCase().includes("dự phòng") ||
          goal.title.toLowerCase().includes("khẩn cấp")
      ) || goalsResponse.goals?.[0] || null;

      const currentEmergencyFund = emergencyFundGoal?.current_amount || 0;
      const targetEmergencyFund = emergencyFundGoal?.target_amount || 0;

      // Calculate preview with current allocation amount
      const newEmergencyFundTotal = currentEmergencyFund + allocationAmount;
      
      // Calculate months of coverage (assuming 3 months is the goal for emergency fund)
      const estimatedMonthlyExpenses = totalSpent > 0 ? totalSpent : totalBudget / 3;
      const newMonthsOfCoverage = estimatedMonthlyExpenses > 0 
        ? newEmergencyFundTotal / estimatedMonthlyExpenses 
        : 0;

      // Calculate progress impact
      const currentProgress = targetEmergencyFund > 0 
        ? (currentEmergencyFund / targetEmergencyFund) * 100 
        : 0;
      const newProgress = targetEmergencyFund > 0 
        ? (newEmergencyFundTotal / targetEmergencyFund) * 100 
        : 0;
      const progressImpact = newProgress - currentProgress;

      return {
        surplusAmount,
        currentEmergencyFund,
        allocationAmount,
        newEmergencyFundTotal,
        newMonthsOfCoverage,
        progressImpact,
        hasSurplus,
        emergencyFundGoal: emergencyFundGoal ? {
          id: emergencyFundGoal.id,
          title: emergencyFundGoal.title,
          targetAmount: emergencyFundGoal.target_amount || 0,
          currentAmount: emergencyFundGoal.current_amount || 0,
        } : null,
      };
    },
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
      dedupingInterval: 30000,
    }
  );

  // Update the data when allocation amount changes
  const updatedData = data ? {
    ...data,
    allocationAmount,
    newEmergencyFundTotal: data.currentEmergencyFund + allocationAmount,
    newMonthsOfCoverage: data.currentEmergencyFund + allocationAmount > 0 
      ? (data.currentEmergencyFund + allocationAmount) / (data.surplusAmount || 1)
      : 0,
    progressImpact: data.emergencyFundGoal?.targetAmount 
      ? ((data.currentEmergencyFund + allocationAmount) / data.emergencyFundGoal.targetAmount * 100) 
        - (data.currentEmergencyFund / data.emergencyFundGoal.targetAmount * 100)
      : 0,
  } : null;

  const allocateToEmergencyFund = async (): Promise<boolean> => {
    if (!data?.emergencyFundGoal || allocationAmount <= 0) return false;

    setIsAllocating(true);
    try {
      const updateData = {
        current_amount: data.currentEmergencyFund + allocationAmount,
      };

      const response = await goalService.update(data.emergencyFundGoal.id, updateData, t);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Reset allocation amount and refresh data
      setAllocationAmount(0);
      await mutate();
      return true;
    } catch (error) {
      console.error("Error allocating to emergency fund:", error);
      return false;
    } finally {
      setIsAllocating(false);
    }
  };

  return {
    data: updatedData,
    loading: isLoading,
    error: error?.message || null,
    allocationAmount,
    setAllocationAmount,
    allocateToEmergencyFund,
    isAllocating,
    refetch: async () => {
      await mutate();
    },
  };
} 