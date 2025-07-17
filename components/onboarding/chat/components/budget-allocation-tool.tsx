/**
 * Budget Allocation Tool Component
 * 
 * This component has been refactored to follow SOLID principles and maintain
 * better code organization. The implementation is now split into smaller components:
 * - useBudgetAllocation hook for logic
 * - BudgetAllocationForm for UI
 * - BudgetCategoryCard for individual categories
 * 
 * @deprecated The original implementation violated the 200-line limit.
 * Now using the refactored version that properly separates concerns.
 */
import BudgetAllocationToolRefactored from "./budget-allocation-tool-refactored";
import { OnboardingComponent, ComponentResponse } from "@/lib/types/onboarding.types";

interface BudgetAllocationToolProps {
  component: OnboardingComponent;
  onResponse: (response: ComponentResponse) => Promise<void>;
}

export default function BudgetAllocationTool(props: BudgetAllocationToolProps) {
  // Use the refactored implementation
  return <BudgetAllocationToolRefactored {...props} />;
}