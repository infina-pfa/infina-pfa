/**
 * Budget SWR Hooks
 * Export all budget-related hooks from grouped modules
 */

// Budget CRUD operations
export {
  useBudgets,
  useBudgetDetail,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
} from "./use-budget-operations";

// Spending operations
export {
  useMonthlySpending,
  useRecordSpending,
  useDeleteSpending,
} from "./use-budget-spending";