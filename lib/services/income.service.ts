import { apiClient } from "@/lib/api-client";
import {
  Income,
  CreateIncomeRequest,
  UpdateIncomeRequest,
  GetIncomesQuery,
  IncomeSummary,
} from "@/lib/types/income.types";

export const incomeService = {
  /**
   * Get all incomes with optional filtering
   */
  async getAll(query?: GetIncomesQuery): Promise<Income[]> {
    const params: Record<string, string | number> = {};

    if (query?.from_date) params.from_date = query.from_date;
    if (query?.to_date) params.to_date = query.to_date;
    if (query?.is_recurring !== undefined && query.is_recurring !== null) {
      params.is_recurring = query.is_recurring.toString();
    }
    if (query?.limit) params.limit = query.limit;
    if (query?.offset) params.offset = query.offset;

    const result = await apiClient.get<Income[]>(
      "/incomes",
      Object.keys(params).length ? params : undefined
    );
    return result.data || [];
  },

  /**
   * Get a single income by ID
   */
  async getById(id: string): Promise<Income | null> {
    if (!id) throw new Error("Income ID is required");

    const result = await apiClient.get<Income>(`/incomes/${id}`);
    return result.data || null;
  },

  /**
   * Create a new income
   */
  async create(data: CreateIncomeRequest): Promise<Income> {
    // Validate required fields
    if (!data.amount || data.amount <= 0) {
      throw new Error("Income amount must be greater than 0");
    }

    if (!data.date) {
      throw new Error("Income date is required");
    }

    if (!data.description?.trim()) {
      throw new Error("Income description is required");
    }

    // Validate description length
    if (data.description.length > 500) {
      throw new Error("Description cannot exceed 500 characters");
    }

    // Validate pay yourself percent if provided
    if (
      data.pay_yourself_percent !== undefined &&
      data.pay_yourself_percent !== null
    ) {
      if (data.pay_yourself_percent < 0 || data.pay_yourself_percent > 100) {
        throw new Error("Pay yourself percent must be between 0 and 100");
      }
    }

    const result = await apiClient.post<Income>("/incomes", data);

    if (!result.data) {
      throw new Error("Failed to create income");
    }

    return result.data;
  },

  /**
   * Update an existing income
   */
  async update(id: string, data: UpdateIncomeRequest): Promise<Income> {
    if (!id) throw new Error("Income ID is required");

    // Validate fields if provided
    if (data.amount !== undefined && data.amount <= 0) {
      throw new Error("Income amount must be greater than 0");
    }

    if (data.description !== undefined && !data.description.trim()) {
      throw new Error("Income description cannot be empty");
    }

    // Validate description length if provided
    if (data.description && data.description.length > 500) {
      throw new Error("Description cannot exceed 500 characters");
    }

    // Validate pay yourself percent if provided
    if (
      data.pay_yourself_percent !== undefined &&
      data.pay_yourself_percent !== null
    ) {
      if (data.pay_yourself_percent < 0 || data.pay_yourself_percent > 100) {
        throw new Error("Pay yourself percent must be between 0 and 100");
      }
    }

    const result = await apiClient.put<Income>(`/incomes/${id}`, data);

    if (!result.data) {
      throw new Error("Failed to update income");
    }

    return result.data;
  },

  /**
   * Delete an income
   */
  async delete(id: string): Promise<void> {
    if (!id) throw new Error("Income ID is required");

    await apiClient.delete(`/incomes/${id}`);
  },

  /**
   * Get income summary with calculations
   */
  async getSummary(query?: GetIncomesQuery): Promise<IncomeSummary> {
    const incomes = await this.getAll(query);

    const summary: IncomeSummary = {
      total: 0,
      count: incomes.length,
      recurring_total: 0,
      one_time_total: 0,
      by_month: {},
      average_pay_yourself_percent: 0,
    };

    let totalPayYourselfPercent = 0;
    let payYourselfCount = 0;

    incomes.forEach((income) => {
      summary.total += income.amount;

      // Group by recurring vs one-time
      if (income.is_recurring) {
        summary.recurring_total! += income.amount;
      } else {
        summary.one_time_total! += income.amount;
      }

      // Group by month
      const monthKey = new Date(income.date).toISOString().substring(0, 7); // YYYY-MM format
      summary.by_month![monthKey] = (summary.by_month![monthKey] || 0) + income.amount;

      // Calculate average pay yourself percent
      if (income.pay_yourself_percent !== null && income.pay_yourself_percent !== undefined) {
        totalPayYourselfPercent += income.pay_yourself_percent;
        payYourselfCount++;
      }
    });

    // Calculate average pay yourself percent
    if (payYourselfCount > 0) {
      summary.average_pay_yourself_percent = totalPayYourselfPercent / payYourselfCount;
    }

    return summary;
  },
}; 