import { apiClient } from '@/lib/api-client';
import {
  Budget,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  GetBudgetsQuery,
} from '@/lib/types/budget.types';

export const budgetService = {
  /**
   * Get all budgets with optional filtering
   */
  async getAll(query?: GetBudgetsQuery): Promise<Budget[]> {
    const params: Record<string, string | number> = {};
    
    if (query?.category) params.category = query.category;
    if (query?.limit) params.limit = query.limit;
    if (query?.offset) params.offset = query.offset;
    
    const result = await apiClient.get<Budget[]>('/budgets', Object.keys(params).length ? params : undefined);
    return result.data || [];
  },

  /**
   * Get a single budget by ID
   */
  async getById(id: string): Promise<Budget | null> {
    if (!id) throw new Error('Budget ID is required');
    
    const result = await apiClient.get<Budget>(`/budgets/${id}`);
    return result.data || null;
  },

  /**
   * Create a new budget
   */
  async create(data: CreateBudgetRequest): Promise<Budget> {
    // Validate required fields
    if (!data.name?.trim()) {
      throw new Error('Budget name is required');
    }
    
    if (!data.amount || data.amount <= 0) {
      throw new Error('Budget amount must be greater than 0');
    }
    
    if (!data.ended_at) {
      throw new Error('End date is required');
    }
    
    // Validate date range
    const startDate = data.started_at ? new Date(data.started_at) : new Date();
    const endDate = new Date(data.ended_at);
    
    if (endDate <= startDate) {
      throw new Error('End date must be after start date');
    }
    
    const result = await apiClient.post<Budget>('/budgets', data);
    
    if (!result.data) {
      throw new Error('Failed to create budget');
    }
    
    return result.data;
  },

  /**
   * Update an existing budget
   */
  async update(id: string, data: UpdateBudgetRequest): Promise<Budget> {
    if (!id) throw new Error('Budget ID is required');
    
    // Validate fields if provided
    if (data.name !== undefined && !data.name.trim()) {
      throw new Error('Budget name cannot be empty');
    }
    
    if (data.amount !== undefined && data.amount <= 0) {
      throw new Error('Budget amount must be greater than 0');
    }
    
    // Validate date range if dates are provided
    if (data.started_at && data.ended_at) {
      const startDate = new Date(data.started_at);
      const endDate = new Date(data.ended_at);
      
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
    }
    
    const result = await apiClient.put<Budget>(`/budgets/${id}`, data);
    
    if (!result.data) {
      throw new Error('Failed to update budget');
    }
    
    return result.data;
  },

  /**
   * Delete a budget
   */
  async delete(id: string): Promise<void> {
    if (!id) throw new Error('Budget ID is required');
    
    await apiClient.delete(`/budgets/${id}`);
  },
}; 