import { useState, useCallback, useMemo, useEffect } from "react";
import { useAppTranslation } from "@/hooks/use-translation";
import { useDebounce } from "@/hooks/use-debounce";

export interface AllocationData {
  emergencyFund: number;
  livingExpenses: number;
  freeToSpend: number;
}

interface UseBudgetAllocationProps {
  monthlyIncome: number;
  emergencyFundTarget: number;
  monthlyTargetSavings: number;
  budgetingStyle?: "goal_focused" | "detail_tracker";
  expenseBreakdown?: Record<string, number>;
  initialAllocation?: AllocationData;
}

interface UseBudgetAllocationReturn {
  allocation: AllocationData;
  validationErrors: string[];
  totalPercentage: number;
  isValid: boolean;
  updateAllocation: (category: keyof AllocationData, value: number) => void;
  handlePercentageChange: (category: keyof AllocationData, value: string) => void;
  autoAdjustAllocation: (changedCategory: keyof AllocationData, newValue: number) => void;
  validateAllocation: (allocationData: AllocationData) => string[];
  calculateMonetaryValue: (percentage: number) => number;
  monetaryValues: {
    emergencyFund: number;
    livingExpenses: number;
    freeToSpend: number;
  };
}

export const useBudgetAllocation = ({
  monthlyIncome,
  emergencyFundTarget,
  monthlyTargetSavings,
  budgetingStyle = "goal_focused",
  expenseBreakdown = {},
  initialAllocation,
}: UseBudgetAllocationProps): UseBudgetAllocationReturn => {
  const { t } = useAppTranslation(["budgeting"]);

  // Initialize allocation state
  const [allocation, setAllocation] = useState<AllocationData>(() => {
    if (initialAllocation) {
      return initialAllocation;
    }

    // Calculate emergency fund percentage
    const emergencyFundPercentage = (monthlyTargetSavings / monthlyIncome) * 100;

    // Calculate living expenses based on budgeting style
    let livingExpensesPercentage: number;

    if (budgetingStyle === "detail_tracker" && Object.keys(expenseBreakdown).length > 0) {
      // Calculate actual living expenses from expense breakdown
      const totalExpenses = Object.values(expenseBreakdown).reduce((sum, amount) => {
        return sum + (typeof amount === "number" ? amount : 0);
      }, 0);
      livingExpensesPercentage = (totalExpenses / monthlyIncome) * 100;

      console.log("📊 Budget allocation - Detail tracker calculation:", {
        budgetingStyle,
        expenseBreakdown,
        totalExpenses,
        monthlyIncome,
        livingExpensesPercentage,
      });
    } else {
      // Default allocation for goal_focused users
      const remainingPercentage = 100 - emergencyFundPercentage;
      livingExpensesPercentage = remainingPercentage * 0.7; // 70% of remaining

      console.log("📊 Budget allocation - Goal focused calculation:", {
        budgetingStyle,
        emergencyFundPercentage,
        remainingPercentage,
        livingExpensesPercentage,
      });
    }

    // Calculate free to spend (remaining after emergency fund and living expenses)
    const freeToSpendPercentage = Math.max(
      0,
      100 - emergencyFundPercentage - livingExpensesPercentage
    );

    const calculatedAllocation = {
      emergencyFund: emergencyFundPercentage,
      livingExpenses: livingExpensesPercentage,
      freeToSpend: freeToSpendPercentage,
    };

    console.log("📊 Budget allocation - Final calculated allocation:", calculatedAllocation);

    return calculatedAllocation;
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Debounce allocation changes for performance
  const debouncedAllocation = useDebounce(allocation, 300);

  // Calculate monetary values with memoization
  const calculateMonetaryValue = useCallback(
    (percentage: number) => {
      return (monthlyIncome * percentage) / 100;
    },
    [monthlyIncome]
  );

  // Memoize monetary values for each category
  const monetaryValues = useMemo(() => ({
    emergencyFund: calculateMonetaryValue(debouncedAllocation.emergencyFund),
    livingExpenses: calculateMonetaryValue(debouncedAllocation.livingExpenses),
    freeToSpend: calculateMonetaryValue(debouncedAllocation.freeToSpend),
  }), [debouncedAllocation, calculateMonetaryValue]);

  // Validate allocation
  const validateAllocation = useCallback(
    (allocationData: AllocationData): string[] => {
      const errors: string[] = [];
      const total = allocationData.emergencyFund + allocationData.livingExpenses + allocationData.freeToSpend;

      // Check total is 100%
      if (Math.abs(total - 100) > 0.1) {
        errors.push(
          t("totalMustBe100Percent", {
            ns: "budgeting",
            defaultValue: "Total allocation must equal 100%",
          })
        );
      }

      // Check Free to Spend rule (≤ 2x Emergency Fund)
      const emergencyFundAmount = calculateMonetaryValue(allocationData.emergencyFund);
      const freeToSpendAmount = calculateMonetaryValue(allocationData.freeToSpend);

      if (freeToSpendAmount > emergencyFundAmount * 2) {
        errors.push(
          t("freeToSpendRule", {
            ns: "budgeting",
            defaultValue: "Free to Spend cannot exceed 2x your Emergency Fund amount",
          })
        );
      }

      // Check minimum emergency fund (at least 10%)
      if (allocationData.emergencyFund < 10) {
        errors.push(
          t("minimumEmergencyFund", {
            ns: "budgeting",
            defaultValue: "Emergency Fund should be at least 10% of your income",
          })
        );
      }

      // Additional validation for detail_tracker users
      if (budgetingStyle === "detail_tracker" && Object.keys(expenseBreakdown).length > 0) {
        const actualExpensesAmount = Object.values(expenseBreakdown).reduce((sum, amount) => {
          return sum + (typeof amount === "number" ? amount : 0);
        }, 0);
        const currentLivingExpensesAmount = calculateMonetaryValue(allocationData.livingExpenses);

        // Warn if living expenses allocation is significantly different from actual expenses
        const difference = Math.abs(currentLivingExpensesAmount - actualExpensesAmount);
        const threshold = actualExpensesAmount * 0.1; // 10% threshold

        if (difference > threshold) {
          console.warn("⚠️ Living expenses allocation differs significantly from actual expenses:", {
            actualExpensesAmount,
            currentLivingExpensesAmount,
            difference,
            threshold,
          });
        }
      }

      return errors;
    },
    [t, calculateMonetaryValue, budgetingStyle, expenseBreakdown]
  );

  // Update allocation and validate (with Emergency Fund lock)
  const updateAllocation = useCallback(
    (category: keyof AllocationData, value: number) => {
      // Emergency Fund is locked - cannot be changed
      if (category === "emergencyFund") {
        return;
      }

      const newAllocation = { ...allocation, [category]: value };

      // Auto-adjust the other non-emergency category to maintain 100%
      const emergencyFundPercentage = allocation.emergencyFund;
      const remainingForOthers = 100 - emergencyFundPercentage;

      if (category === "livingExpenses") {
        // Adjust freeToSpend to maintain 100%
        newAllocation.freeToSpend = remainingForOthers - value;
      } else if (category === "freeToSpend") {
        // Adjust livingExpenses to maintain 100%
        newAllocation.livingExpenses = remainingForOthers - value;
      }

      // Ensure values are within valid range
      newAllocation.livingExpenses = Math.max(0, Math.min(remainingForOthers, newAllocation.livingExpenses));
      newAllocation.freeToSpend = Math.max(0, Math.min(remainingForOthers, newAllocation.freeToSpend));

      setAllocation(newAllocation);
      setValidationErrors(validateAllocation(newAllocation));
    },
    [allocation, validateAllocation]
  );

  // Handle percentage input change
  const handlePercentageChange = useCallback(
    (category: keyof AllocationData, value: string) => {
      // Emergency Fund is locked - cannot be changed
      if (category === "emergencyFund") {
        return;
      }

      const numValue = parseFloat(value) || 0;
      const clampedValue = Math.max(0, Math.min(100, numValue));

      // Check if the value would exceed the available remaining percentage
      const emergencyFundPercentage = allocation.emergencyFund;
      const remainingForOthers = 100 - emergencyFundPercentage;
      const finalValue = Math.min(clampedValue, remainingForOthers);

      updateAllocation(category, finalValue);
    },
    [allocation.emergencyFund, updateAllocation]
  );

  // Auto-adjust allocation to maintain 100% (Emergency Fund locked)
  const autoAdjustAllocation = useCallback(
    (changedCategory: keyof AllocationData, newValue: number) => {
      // Emergency Fund is locked - no auto-adjustment available
      if (changedCategory === "emergencyFund") {
        return;
      }

      const emergencyFundPercentage = allocation.emergencyFund;
      const remainingForOthers = 100 - emergencyFundPercentage;
      const otherCategory = changedCategory === "livingExpenses" ? "freeToSpend" : "livingExpenses";
      const otherValue = remainingForOthers - newValue;

      if (otherValue >= 0) {
        const newAllocation = {
          ...allocation,
          [changedCategory]: newValue,
          [otherCategory]: otherValue,
        };

        setAllocation(newAllocation);
        setValidationErrors(validateAllocation(newAllocation));
      }
    },
    [allocation, validateAllocation]
  );

  // Memoize total percentage calculation
  const totalPercentage = useMemo(
    () => allocation.emergencyFund + allocation.livingExpenses + allocation.freeToSpend,
    [allocation]
  );

  // Validate debounced allocation to prevent excessive validation
  useEffect(() => {
    const errors = validateAllocation(debouncedAllocation);
    setValidationErrors(errors);
  }, [debouncedAllocation, validateAllocation]);

  // Memoize isValid calculation
  const isValid = useMemo(
    () => validationErrors.length === 0 && Math.abs(totalPercentage - 100) < 0.1,
    [validationErrors, totalPercentage]
  );

  return {
    allocation,
    validationErrors,
    totalPercentage,
    isValid,
    updateAllocation,
    handlePercentageChange,
    autoAdjustAllocation,
    validateAllocation,
    calculateMonetaryValue,
    monetaryValues, // Export pre-calculated monetary values
  };
};