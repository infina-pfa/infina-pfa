import { useState, useEffect, useCallback } from "react";
import {
  Budget,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  GetBudgetsQuery,
  BudgetResponse,
  BudgetsListResponse,
} from "@/lib/types/budget.types";

interface UseBudgetsReturn {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
  createBudget: (data: CreateBudgetRequest) => Promise<Budget | null>;
  updateBudget: (id: string, data: UpdateBudgetRequest) => Promise<Budget | null>;
  deleteBudget: (id: string) => Promise<boolean>;
  getBudget: (id: string) => Promise<Budget | null>;
  refreshBudgets: () => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export const useBudgets = (query?: GetBudgetsQuery): UseBudgetsReturn => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Build query string for API call
  const buildQueryString = useCallback((params?: GetBudgetsQuery): string => {
    if (!params) return "";
    
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.append("category", params.category);
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.offset) searchParams.append("offset", params.offset.toString());
    
    return searchParams.toString() ? `?${searchParams.toString()}` : "";
  }, []);

  // Fetch budgets
  const fetchBudgets = useCallback(async (params?: GetBudgetsQuery) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryString = buildQueryString(params);
      const response = await fetch(`/api/budgets${queryString}`);
      const result: BudgetsListResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch budgets");
      }
      
      if (result.success && result.data) {
        setBudgets(result.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching budgets:", err);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  // Create budget
  const createBudget = useCallback(async (data: CreateBudgetRequest): Promise<Budget | null> => {
    try {
      setIsCreating(true);
      setError(null);
      
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const result: BudgetResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to create budget");
      }
      
      if (result.success && result.data) {
        setBudgets(prev => [result.data!, ...prev]);
        return result.data;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error creating budget:", err);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  // Update budget
  const updateBudget = useCallback(async (id: string, data: UpdateBudgetRequest): Promise<Budget | null> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const response = await fetch(`/api/budgets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const result: BudgetResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to update budget");
      }
      
      if (result.success && result.data) {
        setBudgets(prev => 
          prev.map(budget => 
            budget.id === id ? result.data! : budget
          )
        );
        return result.data;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error updating budget:", err);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Delete budget
  const deleteBudget = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);
      
      const response = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
      });
      
      const result: BudgetResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete budget");
      }
      
      if (result.success) {
        setBudgets(prev => prev.filter(budget => budget.id !== id));
        return true;
      }
      
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error deleting budget:", err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Get single budget
  const getBudget = useCallback(async (id: string): Promise<Budget | null> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/budgets/${id}`);
      const result: BudgetResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch budget");
      }
      
      if (result.success && result.data) {
        return result.data;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching budget:", err);
      return null;
    }
  }, []);

  // Refresh budgets
  const refreshBudgets = useCallback(async () => {
    await fetchBudgets(query);
  }, [fetchBudgets, query]);

  // Initial fetch
  useEffect(() => {
    fetchBudgets(query);
  }, [fetchBudgets, query]);

  return {
    budgets,
    loading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    getBudget,
    refreshBudgets,
    isCreating,
    isUpdating,
    isDeleting,
  };
};

// Hook for managing a single budget
export const useBudget = (id: string) => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudget = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/budgets/${id}`);
      const result: BudgetResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch budget");
      }
      
      if (result.success && result.data) {
        setBudget(result.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching budget:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchBudget();
    }
  }, [fetchBudget, id]);

  return {
    budget,
    loading,
    error,
    refetch: fetchBudget,
  };
}; 