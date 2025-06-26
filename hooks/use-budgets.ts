// @deprecated - Use focused hooks instead for better maintainability:
// - useBudgetList() for listing budgets
// - useBudgetCreate() for creating budgets  
// - useBudgetUpdate() for updating budgets
// - useBudgetDelete() for deleting budgets
// - useBudget() for single budget
// - useBudgetManagement() for full CRUD (composition)

import { GetBudgetsQuery } from "@/lib/types/budget.types";
import { useBudgetManagement } from "./budget/use-budget-management";

/**
 * @deprecated Use individual focused hooks or useBudgetManagement() instead
 * This hook is maintained for backward compatibility only
 */
export const useBudgets = (query?: GetBudgetsQuery) => {
  console.warn(
    'useBudgets is deprecated. Use focused hooks:\n' +
    '- useBudgetList() for listing\n' +
    '- useBudgetCreate() for creation\n' +
    '- useBudgetUpdate() for updates\n' +
    '- useBudgetDelete() for deletion\n' +
    '- useBudgetManagement() for full CRUD'
  );
  
  return useBudgetManagement(query);
};

// Re-export the new focused hooks for easy migration
export { useBudgetList } from './budget/use-budget-list';
export { useBudgetCreate } from './budget/use-budget-create';
export { useBudgetUpdate } from './budget/use-budget-update';  
export { useBudgetDelete } from './budget/use-budget-delete';
export { useBudget } from './budget/use-budget';
export { useBudgetManagement } from './budget/use-budget-management'; 