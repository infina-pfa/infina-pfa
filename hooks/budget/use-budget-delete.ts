import { useState, useCallback } from 'react';
import { budgetService } from '@/lib/services/budget.service';
import { handleError } from '@/lib/error-handler';
import { useToast } from '@/components/ui/toast';

export const useBudgetDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  const deleteBudget = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);
      
      await budgetService.delete(id);
      success('Budget deleted successfully', 'Budget has been removed');
      return true;
    } catch (err) {
      const appError = handleError(err);
      setError(appError.message);
      showError('Failed to delete budget', appError.message);
      console.error('Budget deletion error:', appError);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [success, showError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    deleteBudget,
    isDeleting,
    error,
    clearError
  };
}; 