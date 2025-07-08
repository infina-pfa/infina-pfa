import { useBudgetListSWR } from './use-budget-list';
import { useBudgetCreateSWR } from './use-budget-create';
import { useBudgetUpdateSWR } from './use-budget-update';
import { useBudgetDeleteSWR } from './use-budget-delete';
import { BudgetFilters } from '@/lib/types/budget.types';

/**
 * Composition hook that combines all SWR budget operations
 * Use this when you need multiple budget operations in a single component
 * For single operations, prefer using individual hooks for better performance
 */
export function useBudgetManagementSWR(filters?: BudgetFilters) {
  const list = useBudgetListSWR(filters);
  const create = useBudgetCreateSWR();
  const update = useBudgetUpdateSWR();
  const deleteHook = useBudgetDeleteSWR();

  return {
    // List operations
    budgets: list.budgets,
    totalBudget: list.totalBudget,
    totalSpent: list.totalSpent,
    refetchBudgets: list.refetch,
    
    // Create operations
    createBudget: create.createBudget,
    isCreating: create.isCreating,
    
    // Update operations
    updateBudget: update.updateBudget,
    isUpdating: update.isUpdating,
    
    // Delete operations
    deleteBudget: deleteHook.deleteBudget,
    isDeleting: deleteHook.isDeleting,
    
    // Combined states
    loading: list.loading || create.isCreating || update.isUpdating || deleteHook.isDeleting,
    error: list.error || create.error || update.error || deleteHook.error,
  };
} 