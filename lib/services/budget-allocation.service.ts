import { apiClient } from "@/lib/api-client";

interface BudgetAllocationRequest {
  allocationData: {
    emergencyFund: number;
    livingExpenses: number;
    freeToSpend: number;
  };
  monthlyIncome: number;
  budgetingStyle?: "goal_focused" | "detail_tracker";
  expenseBreakdown?: Record<string, number>;
}

interface BudgetAllocationResponse {
  budgets: Array<{
    id: string;
    name: string;
    category: string;
    amount: number;
    color: string;
    icon: string;
  }>;
  budgetingStyle: string;
  allocation: {
    emergencyFund: number;
    livingExpenses: number;
    freeToSpend: number;
  };
  totalBudgets: number;
}

// Category ID mapping between frontend and backend
const CATEGORY_ID_MAPPING: Record<string, string> = {
  // Frontend ID -> Backend ID
  housing: "house_rent",
  food: "food",
  transport: "transportation",
  other: "others",
};

class BudgetAllocationService {
  /**
   * Create budget allocation from onboarding data
   * This properly maps frontend category IDs to backend expected IDs
   */
  async createBudgetAllocation(
    request: BudgetAllocationRequest
  ): Promise<{ success: boolean; data?: BudgetAllocationResponse; error?: string }> {
    try {
      // Map expense breakdown category IDs if present
      let mappedExpenseBreakdown: Record<string, number> | undefined;
      
      if (request.expenseBreakdown) {
        mappedExpenseBreakdown = {};
        
        Object.entries(request.expenseBreakdown).forEach(([frontendId, amount]) => {
          // Use mapping if available, otherwise use original ID
          const backendId = CATEGORY_ID_MAPPING[frontendId] || frontendId;
          mappedExpenseBreakdown![backendId] = amount;
          
          console.log(`📋 Mapping category: ${frontendId} -> ${backendId} (amount: ${amount})`);
        });
      }

      // Create request with mapped categories
      const mappedRequest = {
        ...request,
        expenseBreakdown: mappedExpenseBreakdown,
      };

      console.log("🚀 Sending budget allocation request:", mappedRequest);

      const response = await apiClient.post<BudgetAllocationResponse>(
        "/budgets/allocation",
        mappedRequest
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create budget allocation");
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating budget allocation:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create budget allocation",
      };
    }
  }

  /**
   * Get category mapping for display purposes
   */
  getCategoryMapping() {
    return {
      frontend: {
        housing: { id: "housing", name: "Housing", icon: "home", color: "#0055FF" },
        food: { id: "food", name: "Food", icon: "utensils", color: "#FF9800" },
        transport: { id: "transport", name: "Transportation", icon: "car", color: "#2ECC71" },
        other: { id: "other", name: "Other Expenses", icon: "shopping-cart", color: "#F44336" },
      },
      backend: {
        house_rent: { id: "house_rent", name: "Housing & Rent", icon: "home", color: "#0055FF" },
        food: { id: "food", name: "Food & Dining", icon: "utensils", color: "#FF9800" },
        transportation: { id: "transportation", name: "Transportation", icon: "car", color: "#2ECC71" },
        utilities: { id: "utilities", name: "Utilities", icon: "zap", color: "#FFC107" },
        others: { id: "others", name: "Other Living Expenses", icon: "shopping-cart", color: "#F44336" },
        other_essentials: { id: "other_essentials", name: "Other Essentials", icon: "shopping-cart", color: "#F44336" },
      },
      mapping: CATEGORY_ID_MAPPING,
    };
  }

  /**
   * Validate allocation percentages
   */
  validateAllocation(allocation: BudgetAllocationRequest["allocationData"]): string[] {
    const errors: string[] = [];
    const total = allocation.emergencyFund + allocation.livingExpenses + allocation.freeToSpend;

    // Check total is 100%
    if (Math.abs(total - 100) > 0.1) {
      errors.push("Total allocation must equal 100%");
    }

    // Check minimum emergency fund (at least 10%)
    if (allocation.emergencyFund < 10) {
      errors.push("Emergency Fund should be at least 10% of your income");
    }

    // Check Free to Spend rule (cannot exceed 2x Emergency Fund)
    if (allocation.freeToSpend > allocation.emergencyFund * 2) {
      errors.push("Free to Spend cannot exceed 2x your Emergency Fund percentage");
    }

    return errors;
  }
}

export const budgetAllocationService = new BudgetAllocationService();