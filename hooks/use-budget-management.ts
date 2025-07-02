import { useBudgetList } from './use-budget-list';
import { useBudgetCreate } from './use-budget-create';
import { useBudgetUpdate } from './use-budget-update';
import { useBudgetDelete } from './use-budget-delete';
import { useBudgetStats } from './use-budget-stats';
import { BudgetFilters } from '@/lib/types/budget.types';

export interface UseBudgetManagementReturn {
  list: ReturnType<typeof useBudgetList>;
  create: ReturnType<typeof useBudgetCreate>;
  update: ReturnType<typeof useBudgetUpdate>;
  delete: ReturnType<typeof useBudgetDelete>;
  stats: ReturnType<typeof useBudgetStats>;
}

/**
 * Composition hook that combines all budget operations
 * Use this when you need multiple budget operations in a single component
 * For single operations, prefer using individual hooks for better performance
 */
export const useBudgetManagement = (filters?: BudgetFilters): UseBudgetManagementReturn => {
  const list = useBudgetList(filters);
  const create = useBudgetCreate();
  const update = useBudgetUpdate();
  const deleteHook = useBudgetDelete();
  const stats = useBudgetStats();

  return {
    list,
    create,
    update,
    delete: deleteHook,
    stats,
  };
}; 