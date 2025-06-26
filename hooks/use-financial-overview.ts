import { useCallback, useMemo } from 'react';
import { useBudgetList } from '@/hooks/budget/use-budget-list';
import { useExpenseSummary } from '@/hooks/expense/use-expense-summary';
import { useIncomeSummary } from '@/hooks/income/use-income-summary';

export interface FinancialOverviewData {
  totalBudget: number;
  totalExpenses: number;
  totalIncome: number;
  remainingBudget: number;
  spendingByBudget: Array<{
    name: string;
    amount: number;
    budgetAmount: number;
    percentage: number;
    color: string;
  }>;
  monthlySpendingTrend: Array<{
    month: string;
    expenses: number;
    budget: number;
  }>;
}

export const useFinancialOverview = () => {
  // Get current month date range (static values)
  const currentMonth = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      from_date: start.toISOString().split('T')[0],
      to_date: end.toISOString().split('T')[0]
    };
  }, []);

  // Fetch data using existing hooks
  const { budgets, loading: budgetsLoading, error: budgetsError } = useBudgetList();
  const { summary: expenseSummary, isLoading: expensesLoading, error: expensesError } = useExpenseSummary(currentMonth);
  const { summary: incomeSummary, isLoading: incomeLoading, error: incomeError } = useIncomeSummary(currentMonth);

  // Aggregate loading and error states using useMemo
  const loading = useMemo(() => {
    return budgetsLoading || expensesLoading || incomeLoading;
  }, [budgetsLoading, expensesLoading, incomeLoading]);

  const error = useMemo(() => {
    return budgetsError || expensesError || incomeError;
  }, [budgetsError, expensesError, incomeError]);

  // Calculate overview data
  const overviewData = useMemo((): FinancialOverviewData => {
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalExpenses = expenseSummary?.total || 0;
    const totalIncome = incomeSummary?.total || 0;
    const remainingBudget = totalBudget - totalExpenses;

    // Calculate spending by budget
    const spendingByBudget = budgets.map(budget => {
      const budgetExpenses = expenseSummary?.by_budget?.[budget.id] || 0;
      const percentage = budget.amount > 0 ? (budgetExpenses / budget.amount) * 100 : 0;
      
      return {
        name: budget.name,
        amount: budgetExpenses,
        budgetAmount: budget.amount,
        percentage: Math.min(percentage, 100),
        color: budget.color
      };
    }).sort((a, b) => b.amount - a.amount);

    // Generate monthly trend (simplified for current implementation)
    const monthlySpendingTrend = [
      {
        month: new Date().toLocaleDateString('en-US', { month: 'short' }),
        expenses: totalExpenses,
        budget: totalBudget
      }
    ];

    return {
      totalBudget,
      totalExpenses,
      totalIncome,
      remainingBudget,
      spendingByBudget: spendingByBudget.slice(0, 5), // Top 5 spending budgets
      monthlySpendingTrend
    };
  }, [budgets, expenseSummary, incomeSummary]);

  const refresh = useCallback(() => {
    // Refresh is handled by individual hooks
  }, []);

  return {
    data: overviewData,
    loading,
    error,
    refresh
  };
}; 