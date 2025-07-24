import { useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAppTranslation } from "@/hooks/use-translation";
import { budgetService } from "@/lib/services/budget.service";
import { onboardingService } from "@/lib/services/onboarding.service";
import {
  ComponentResponse,
  UserProfile,
  FinancialStage,
  OnboardingState,
} from "@/lib/types/onboarding.types";
import { CreateBudgetRequest } from "@/lib/types/budget.types";

interface UseOnboardingProfileProps {
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
}

interface UseOnboardingProfileReturn {
  updateProfileFromResponse: (response: ComponentResponse) => Promise<void>;
  createBudgetsFromExpenseBreakdown: (
    expenseBreakdown: Record<string, number>
  ) => Promise<void>;
}

export const useOnboardingProfile = ({
  setState,
}: UseOnboardingProfileProps): UseOnboardingProfileReturn => {
  const { user } = useAuth();
  const { i18n } = useAppTranslation();

  const createBudgetsFromExpenseBreakdown = useCallback(
    async (expenseBreakdown: Record<string, number>) => {
      try {
        // Get current month and year
        const now = new Date();
        const month = now.getMonth() + 1; // JavaScript months are 0-based
        const year = now.getFullYear();

        // Define budget mapping for expense categories
        const budgetMapping: Record<
          string,
          {
            name: string;
            category: "fixed" | "flexible";
            icon: string;
            color: string;
          }
        > = {
          housing: {
            name: i18n.language === "vi" ? "Nhà ở" : "Housing",
            category: "fixed",
            icon: "home",
            color: "#0055FF",
          },
          rent: {
            name: i18n.language === "vi" ? "Thuê nhà" : "Rent",
            category: "fixed",
            icon: "home",
            color: "#0055FF",
          },
          food: {
            name: i18n.language === "vi" ? "Ăn uống" : "Food",
            category: "fixed",
            icon: "food",
            color: "#2ECC71",
          },
          food_grocery: {
            name: i18n.language === "vi" ? "Ăn uống" : "Food",
            category: "fixed",
            icon: "food",
            color: "#2ECC71",
          },
          transport: {
            name: i18n.language === "vi" ? "Di chuyển" : "Transportation",
            category: "fixed",
            icon: "car",
            color: "#FF9800",
          },
          transportation: {
            name: i18n.language === "vi" ? "Di chuyển" : "Transportation",
            category: "fixed",
            icon: "car",
            color: "#FF9800",
          },
          utilities: {
            name: i18n.language === "vi" ? "Điện, nước, internet" : "Utilities",
            category: "fixed",
            icon: "car",
            color: "#FF9800",
          },
          other: {
            name: i18n.language === "vi" ? "Chi tiêu khác" : "Other Expenses",
            category: "fixed",
            icon: "other",
            color: "#F44336",
          },
        };

        // Get existing budgets first to check for duplicates
        console.log("🔍 Checking for existing budgets...");
        const existingBudgetsResponse = await budgetService.getAll({
          month,
          year,
        });
        const existingBudgets = existingBudgetsResponse.budgets || [];

        // Create/update budgets for each category
        const budgetPromises = Object.entries(expenseBreakdown).map(
          async ([categoryId, amount]) => {
            if (amount > 0 && budgetMapping[categoryId]) {
              const mapping = budgetMapping[categoryId];

              // Check if budget already exists
              const existingBudget = existingBudgets.find(
                (b) => b.name === mapping.name
              );

              if (existingBudget) {
                // Update existing budget
                console.log(
                  `🔄 Updating existing budget for ${categoryId}:`,
                  existingBudget.id
                );

                const updateResult = await budgetService.update(
                  existingBudget.id,
                  {
                    amount,
                    category: mapping.category,
                    icon: mapping.icon,
                    color: mapping.color,
                  }
                );

                if (updateResult.budget) {
                  console.log(
                    `✅ Budget updated for ${categoryId}:`,
                    updateResult.budget
                  );
                } else {
                  console.error(
                    `❌ Failed to update budget for ${categoryId}:`,
                    updateResult.error
                  );
                }
              } else {
                // Create new budget
                const budgetData: CreateBudgetRequest = {
                  month,
                  year,
                  name: mapping.name,
                  category: mapping.category,
                  icon: mapping.icon,
                  color: mapping.color,
                  amount,
                };

                console.log(
                  `📊 Creating new budget for ${categoryId}:`,
                  budgetData
                );

                const result = await budgetService.create(budgetData);

                if (result.budget) {
                  console.log(
                    `✅ Budget created for ${categoryId}:`,
                    result.budget
                  );
                } else {
                  console.error(
                    `❌ Failed to create budget for ${categoryId}:`,
                    result.error
                  );
                }
              }
            }
          }
        );

        // Wait for all budget operations to complete
        await Promise.all(budgetPromises);

        console.log(
          "🎉 Successfully processed all budgets from expense breakdown"
        );
      } catch (error) {
        console.error(
          "❌ Error creating budgets from expense breakdown:",
          error
        );
        // Don't throw error to avoid disrupting the onboarding flow
      }
    },
    [i18n.language]
  );

  const updateProfileFromResponse = useCallback(
    async (response: ComponentResponse) => {
      const profileUpdates: Partial<UserProfile> = {};

      // Handle decision tree response
      if (response.determinedStage && response.answers) {
        profileUpdates.identifiedStage =
          response.determinedStage as FinancialStage;
        profileUpdates.stageConfirmed = true;

        console.log(
          `✅ Decision tree determined stage: ${response.determinedStage}`
        );
        console.log(`📋 User answers:`, response.answers);
        console.log(`🧠 Reasoning:`, response.reasoning);
      }

      // Handle stage selector response (legacy)
      if (response.selectedStage) {
        profileUpdates.identifiedStage = response.selectedStage;
        profileUpdates.stageConfirmed = true;
      }

      // Handle expense categories response
      if (response.expenseBreakdown) {
        profileUpdates.expenseBreakdown = response.expenseBreakdown;

        // Calculate total monthly expenses from all categories
        const breakdown = response.expenseBreakdown;
        let total = 0;

        // Sum all numeric values
        Object.values(breakdown).forEach((value) => {
          if (typeof value === "number") {
            total += value;
          }
        });

        profileUpdates.expenses = total;

        // 🔧 NEW: Create budgets from expense breakdown
        if (user?.id) {
          await createBudgetsFromExpenseBreakdown(breakdown);
        }
      }

      // Handle savings capacity response
      if (response.savingsCapacity) {
        profileUpdates.monthlySavingsCapacity = response.savingsCapacity;
      }

      // Handle goal confirmation response
      if (response.goalConfirmed) {
        // Goal confirmation usually comes with goalDetails
        // This will be handled in the component context
      }

      // Parse different types of responses
      if (response.textValue) {
        // Extract information from text responses
        const text = response.textValue.toLowerCase();

        // Extract name
        if (text.includes("tên") || text.includes("name")) {
          const namePatterns = [
            /(?:tên|name)(?:\s+(?:là|is))?(?:\s+tôi)?(?:\s+)?(?:là)?(?:\s+)?([^,.\n,]+)/i,
            /tôi\s+là\s+([^,.\n]+)/i,
            /mình\s+là\s+([^,.\n]+)/i,
          ];

          for (const pattern of namePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
              profileUpdates.name = match[1].trim();
              break;
            }
          }
        }

        // Extract age
        const ageMatch = text.match(
          /(\d+)\s*tuổi|age.*?(\d+)|(\d+).*?(?:years?\s+old)/i
        );
        if (ageMatch) {
          const age = parseInt(ageMatch[1] || ageMatch[2] || ageMatch[3]);
          if (age && age >= 15 && age <= 100) {
            profileUpdates.age = age;
          }
        }

        // Extract income
        const incomeMatch = text.match(
          /thu\s*nhập.*?(\d+(?:\.\d+)?)\s*(?:triệu|tr)|income.*?(\d+(?:\.\d+)?)\s*(?:million|mil)/i
        );
        if (incomeMatch) {
          const income = parseFloat(incomeMatch[1] || incomeMatch[2]) * 1000000;
          profileUpdates.income = income;
        }

        // Extract expenses
        const expenseMatch = text.match(
          /tiêu.*?(\d+(?:\.\d+)?)\s*(?:triệu|tr)|spend.*?(\d+(?:\.\d+)?)\s*(?:million|mil)/i
        );
        if (expenseMatch) {
          const expenses =
            parseFloat(expenseMatch[1] || expenseMatch[2]) * 1000000;
          profileUpdates.expenses = expenses;
        }
      }

      // Handle other response types
      if (response.financialValue) {
        // This would need context about what type of financial input it was
        // For now, we'll need the component to specify the field
      }

      if (response.selectedOption) {
        // Handle goal selection, risk tolerance, etc.
        // This would need component context to know which field to update
      }

      if (Object.keys(profileUpdates).length > 0) {
        await onboardingService.updateUserProfile(profileUpdates);

        setState((prev) => ({
          ...prev,
          userProfile: { ...prev.userProfile, ...profileUpdates },
        }));
      }
    },
    [user?.id, setState, createBudgetsFromExpenseBreakdown]
  );

  return {
    updateProfileFromResponse,
    createBudgetsFromExpenseBreakdown,
  };
};
