/**
 * Debt SWR Hooks
 * Export all debt-related hooks from grouped modules
 */

// Debt CRUD operations
export {
  useDebts,
  useDebtDetail,
  useMonthlyPayment,
  useCreateDebt,
  useUpdateDebt,
  useDeleteDebt,
} from "./use-debt-operations";

// Payment operations
export {
  useRecordPayment,
  useDeletePayment,
} from "./use-debt-payments";