import { useExpenseList } from './use-expense-list';
import { useExpenseCreate } from './use-expense-create';
import { useExpenseUpdate } from './use-expense-update';
import { useExpenseDelete } from './use-expense-delete';
import { useExpense } from './use-expense';
import { useExpenseSummary } from './use-expense-summary';
import { 
  Expense, 
  CreateExpenseRequest, 
  UpdateExpenseRequest, 
  GetExpensesQuery 
} from '@/lib/types/expense.types';

interface UseExpenseManagementOptions {
  listQuery?: GetExpensesQuery;
  summaryQuery?: GetExpensesQuery;
  selectedExpenseId?: string;
}

export const useExpenseManagement = (options?: UseExpenseManagementOptions) => {
  // Individual hooks
  const list = useExpenseList(options?.listQuery);
  const create = useExpenseCreate();
  const update = useExpenseUpdate();
  const deleteHook = useExpenseDelete();
  const selectedExpense = useExpense(options?.selectedExpenseId);
  const summary = useExpenseSummary(options?.summaryQuery);

  // Combined operations
  const createExpenseAndRefresh = async (data: CreateExpenseRequest): Promise<Expense | null> => {
    const result = await create.createExpense(data);
    if (result) {
      list.refreshExpenses();
      summary.refreshSummary();
    }
    return result;
  };

  const updateExpenseAndRefresh = async (id: string, data: UpdateExpenseRequest): Promise<Expense | null> => {
    const result = await update.updateExpense(id, data);
    if (result) {
      list.refreshExpenses();
      summary.refreshSummary();
      if (options?.selectedExpenseId === id) {
        selectedExpense.refreshExpense();
      }
    }
    return result;
  };

  const deleteExpenseAndRefresh = async (id: string): Promise<boolean> => {
    const result = await deleteHook.deleteExpense(id);
    if (result) {
      list.refreshExpenses();
      summary.refreshSummary();
      if (options?.selectedExpenseId === id) {
        selectedExpense.refreshExpense();
      }
    }
    return result;
  };

  // Combined loading state
  const isLoading = list.isLoading || create.isCreating || update.isUpdating || deleteHook.isDeleting;

  // Combined error state
  const error = create.error || update.error || deleteHook.error || list.error || selectedExpense.error || summary.error;

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
    selectedExpense,
    summary,

    // Combined operations
    createExpenseAndRefresh,
    updateExpenseAndRefresh,
    deleteExpenseAndRefresh,

    // Combined states
    isLoading,
    error,
    clearAllErrors,

    // Quick access to data
    expenses: list.expenses,
    expenseSummary: summary.summary,
    currentExpense: selectedExpense.expense,
  };
}; 