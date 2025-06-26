// Export all income hooks for cleaner imports
export { useIncomeList } from "./use-income-list";
export { useIncomeCreate } from "./use-income-create";
export { useIncomeUpdate } from "./use-income-update";
export { useIncomeDelete } from "./use-income-delete";
export { useIncome } from "./use-income";
export { useIncomeSummary } from "./use-income-summary";
export { useIncomeManagement } from "./use-income-management";

// Re-export types for convenience
export type {
  Income,
  CreateIncomeRequest,
  UpdateIncomeRequest,
  GetIncomesQuery,
  IncomeSummary,
} from "@/lib/types/income.types"; 