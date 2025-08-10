import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/auth/use-auth";

interface BudgetAnalysisData {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  spendingPercentage: number;
}

interface BudgetAnalysisResponse {
  message: string;
  budgetData: BudgetAnalysisData;
}

interface UseBudgetAnalysisReturn {
  analysis: BudgetAnalysisResponse | null;
  loading: boolean;
  error: string | null;
  analyzeBudget: (data: BudgetAnalysisData) => Promise<void>;
  clearAnalysis: () => void;
}

export const useBudgetAnalysis = (): UseBudgetAnalysisReturn => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<BudgetAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeBudget = useCallback(
    async (data: BudgetAnalysisData) => {
      if (!user) {
        setError("User not authenticated");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/chat/budget-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            userName: user.user_metadata?.name || "bạn",
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to analyze budget");
        }

        setAnalysis(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  return {
    analysis,
    loading,
    error,
    analyzeBudget,
    clearAnalysis,
  };
};
