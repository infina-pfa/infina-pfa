import { useCallback } from 'react';
import { useBudgetList } from './use-budget-list';
import { useBudgetCreate } from './use-budget-create';
import { useBudgetUpdate } from './use-budget-update';
import { useBudgetDelete } from './use-budget-delete';
import { GetBudgetsQuery, CreateBudgetRequest, UpdateBudgetRequest } from '@/lib/types/budget.types';

/**
 * Composition hook that combines all budget operations
 * Use this when you need full CRUD functionality
 */
export const useBudgetManagement = (query?: GetBudgetsQuery) => {
  // Individual focused hooks
  const { 
    budgets, 
    loading, 
    error: listError, 
    refresh, 
    addBudget, 
    updateBudget: updateBudgetInList, 
    removeBudget 
  } = useBudgetList(query);
  
  const { 
    createBudget, 
    isCreating, 
    error: createError 
  } = useBudgetCreate();
  
  const { 
    updateBudget, 
    isUpdating, 
    error: updateError 
  } = useBudgetUpdate();
  
  const { 
    deleteBudget, 
    isDeleting, 
    error: deleteError 
  } = useBudgetDelete();

  // Composed operations that update the list automatically
  const handleCreateBudget = useCallback(async (data: CreateBudgetRequest) => {
    const newBudget = await createBudget(data);
    if (newBudget) {
      addBudget(newBudget);
    }
    return newBudget;
  }, [createBudget, addBudget]);

  const handleUpdateBudget = useCallback(async (id: string, data: UpdateBudgetRequest) => {
    const updatedBudget = await updateBudget(id, data);
    if (updatedBudget) {
      updateBudgetInList(updatedBudget);
    }
    return updatedBudget;
  }, [updateBudget, updateBudgetInList]);

  const handleDeleteBudget = useCallback(async (id: string) => {
    const success = await deleteBudget(id);
    if (success) {
      removeBudget(id);
    }
    return success;
  }, [deleteBudget, removeBudget]);

  // Combined error (first non-null error)
  const error = listError || createError || updateError || deleteError;

  return {
    // List state
    budgets,
    loading,
    error,
    refresh,
    
    // Operations that automatically update the list
    createBudget: handleCreateBudget,
    updateBudget: handleUpdateBudget,
    deleteBudget: handleDeleteBudget,
    
    // Operation states
    isCreating,
    isUpdating,
    isDeleting,
    
    // Any operation in progress
    isOperating: isCreating || isUpdating || isDeleting,
  };
}; 