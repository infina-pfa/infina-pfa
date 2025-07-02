import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/error-handler";
import { 
  CreateBudgetRequest, 
  UpdateBudgetRequest, 
  BudgetResponse,
  BudgetListResponse,
  BudgetFilters,
  BudgetStats
} from "@/lib/types/budget.types";

// Type for translation function
type TranslationFunction = (key: string, options?: { ns?: string | string[] }) => string;

export const budgetService = {
  /**
   * Get all budgets for the current user with optional filters
   */
  async getAll(filters?: BudgetFilters, t?: TranslationFunction): Promise<BudgetListResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      let query = supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.month) {
        query = query.eq('month', filters.month);
      }
      if (filters?.year) {
        query = query.eq('year', filters.year);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        budgets: data || [],
        error: null,
      };
    } catch (error) {
      const appError = handleError(error, t);
      return {
        budgets: [],
        error: appError.message,
      };
    }
  },

  /**
   * Get a single budget by ID
   */
  async getById(id: string, t?: TranslationFunction): Promise<BudgetResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      return {
        budget: data,
        error: null,
      };
    } catch (error) {
      const appError = handleError(error, t);
      return {
        budget: null,
        error: appError.message,
      };
    }
  },

  /**
   * Create a new budget
   */
  async create(data: CreateBudgetRequest, t?: TranslationFunction): Promise<BudgetResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Validate required fields
      if (!data.name?.trim()) {
        throw new Error('Budget name is required');
      }
      if (!data.month || data.month < 1 || data.month > 12) {
        throw new Error('Valid month is required');
      }
      if (!data.year || data.year < 2020) {
        throw new Error('Valid year is required');
      }

      // Check for duplicate budget name in the same month/year
      const { data: existingBudget } = await supabase
        .from('budgets')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', data.name.trim())
        .eq('month', data.month)
        .eq('year', data.year)
        .single();

      if (existingBudget) {
        throw new Error('Budget with this name already exists for this month');
      }

      const { data: budget, error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          name: data.name.trim(),
          month: data.month,
          year: data.year,
          color: data.color || '#0055FF',
          icon: data.icon || 'wallet',
          category: data.category || 'general',
          amount: data.amount || 0,
        })
        .select('*')
        .single();

      if (error) throw error;

      return {
        budget,
        error: null,
      };
    } catch (error) {
      const appError = handleError(error, t);
      return {
        budget: null,
        error: appError.message,
      };
    }
  },

  /**
   * Update an existing budget
   */
  async update(id: string, data: UpdateBudgetRequest, t?: TranslationFunction): Promise<BudgetResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Check if budget exists and belongs to user
      const { data: existingBudget, error: checkError } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (checkError || !existingBudget) {
        throw new Error('Budget not found');
      }

      // Validate name if provided
      if (data.name !== undefined && !data.name?.trim()) {
        throw new Error('Budget name cannot be empty');
      }

      // Check for duplicate name if name is being updated
      if (data.name && data.name.trim() !== existingBudget.name) {
        const { data: duplicateBudget } = await supabase
          .from('budgets')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', data.name.trim())
          .eq('month', data.month || existingBudget.month)
          .eq('year', data.year || existingBudget.year)
          .neq('id', id)
          .single();

        if (duplicateBudget) {
          throw new Error('Budget with this name already exists for this month');
        }
      }

      const updateData: Record<string, string | number> = {};
      if (data.name !== undefined) updateData.name = data.name.trim();
      if (data.color !== undefined) updateData.color = data.color;
      if (data.icon !== undefined) updateData.icon = data.icon;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.month !== undefined) updateData.month = data.month;
      if (data.year !== undefined) updateData.year = data.year;
      if (data.amount !== undefined) updateData.amount = data.amount;

      const { data: budget, error } = await supabase
        .from('budgets')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single();

      if (error) throw error;

      return {
        budget,
        error: null,
      };
    } catch (error) {
      const appError = handleError(error, t);
      return {
        budget: null,
        error: appError.message,
      };
    }
  },

  /**
   * Delete a budget
   */
  async delete(id: string, t?: TranslationFunction): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Check if budget exists and belongs to user
      const { data: existingBudget, error: checkError } = await supabase
        .from('budgets')
        .select('id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (checkError || !existingBudget) {
        throw new Error('Budget not found');
      }

      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      return {
        success: true,
        error: null,
      };
    } catch (error) {
      const appError = handleError(error, t);
      return {
        success: false,
        error: appError.message,
      };
    }
  },

  /**
   * Get budget statistics
   */
  async getStats(t?: TranslationFunction): Promise<{ stats: BudgetStats | null; error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const { data: allBudgets, error } = await supabase
        .from('budgets')
        .select('id, category, month, year')
        .eq('user_id', user.id);

      if (error) throw error;

      const stats: BudgetStats = {
        totalBudgets: allBudgets?.length || 0,
        categoriesCount: new Set(allBudgets?.map(b => b.category)).size,
        monthlyBudgets: allBudgets?.filter(b => b.month === currentMonth && b.year === currentYear).length || 0,
        yearlyBudgets: allBudgets?.filter(b => b.year === currentYear).length || 0,
      };

      return {
        stats,
        error: null,
      };
    } catch (error) {
      const appError = handleError(error, t);
      return {
        stats: null,
        error: appError.message,
      };
    }
  },
}; 