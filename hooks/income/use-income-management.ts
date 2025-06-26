import { useIncomeList } from "./use-income-list";
import { useIncomeCreate } from "./use-income-create";
import { useIncomeUpdate } from "./use-income-update";
import { useIncomeDelete } from "./use-income-delete";
import { useIncome } from "./use-income";
import { useIncomeSummary } from "./use-income-summary";
import {
  Income,
  CreateIncomeRequest,
  UpdateIncomeRequest,
  GetIncomesQuery,
} from "@/lib/types/income.types";

interface UseIncomeManagementOptions {
  listQuery?: GetIncomesQuery;
  summaryQuery?: GetIncomesQuery;
  selectedIncomeId?: string;
}

export const useIncomeManagement = (options?: UseIncomeManagementOptions) => {
  // Individual hooks
  const list = useIncomeList(options?.listQuery);
  const create = useIncomeCreate();
  const update = useIncomeUpdate();
  const deleteHook = useIncomeDelete();
  const selectedIncome = useIncome(options?.selectedIncomeId);
  const summary = useIncomeSummary(options?.summaryQuery);

  // Combined operations
  const createIncomeAndRefresh = async (
    data: CreateIncomeRequest
  ): Promise<Income | null> => {
    const result = await create.createIncome(data);
    if (result) {
      list.refreshIncomes();
      summary.refreshSummary();
    }
    return result;
  };

  const updateIncomeAndRefresh = async (
    id: string,
    data: UpdateIncomeRequest
  ): Promise<Income | null> => {
    const result = await update.updateIncome(id, data);
    if (result) {
      list.refreshIncomes();
      summary.refreshSummary();
      if (options?.selectedIncomeId === id) {
        selectedIncome.refreshIncome();
      }
    }
    return result;
  };

  const deleteIncomeAndRefresh = async (id: string): Promise<boolean> => {
    const result = await deleteHook.deleteIncome(id);
    if (result) {
      list.refreshIncomes();
      summary.refreshSummary();
      if (options?.selectedIncomeId === id) {
        selectedIncome.refreshIncome();
      }
    }
    return result;
  };

  // Combined loading state
  const isLoading =
    list.isLoading ||
    create.isCreating ||
    update.isUpdating ||
    deleteHook.isDeleting;

  // Combined error state
  const error =
    create.error ||
    update.error ||
    deleteHook.error ||
    list.error ||
    selectedIncome.error ||
    summary.error;

  // Clear all errors
  const clearAllErrors = () => {
    create.clearError();
    update.clearError();
    deleteHook.clearError();
  };

  return {
    // Individual operations
    list,
    create,
    update,
    delete: deleteHook,
    selectedIncome,
    summary,

    // Combined operations
    createIncomeAndRefresh,
    updateIncomeAndRefresh,
    deleteIncomeAndRefresh,

    // Combined states
    isLoading,
    error,
    clearAllErrors,

    // Quick access to data
    incomes: list.incomes,
    incomeSummary: summary.summary,
    currentIncome: selectedIncome.income,
  };
}; 