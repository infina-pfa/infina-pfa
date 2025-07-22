import { Database } from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/server";
import { DateStage } from "@/lib/types/goal.types";
import { FinancialMetadata } from "@/lib/types/user.types";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  endOfMonth,
  endOfWeek,
  isFirstDayOfMonth,
  isLastDayOfMonth,
  isWeekend,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { NextResponse } from "next/server";

const DEFAULT_START_MESSAGE = `
    I'm the system, please start the conversation with user by doing actions:
      1.  Deliver a greeting and announce the new month.
      2.  **Show the Goal Dashboard** to remind the user of their Emergency Fund progress.
      3.  **Emphasize the "Pay Yourself First" rule.** This is the most critical action at the start of the month.
      4.  **Activate the pay_yourself_first_confirmation component** for the user to confirm they have transferred the agreed-upon amount to their emergency fund.
    `;

const getWeekOfMonth = (date: Date): number => {
  // Get the first day of the month
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

  // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay();

  // Get the current date number
  const currentDate = date.getDate();

  // Calculate which week the date falls into
  // Add the offset for the first day of the month and subtract 1 for 0-based indexing
  const weekOfMonth = Math.ceil((currentDate + firstDayOfWeek) / 7);

  return weekOfMonth;
};

const getDateStage = () => {
  const now = new Date();
  if (isFirstDayOfMonth(now)) {
    return DateStage.START_OF_MONTH;
  }
  if (isLastDayOfMonth(now)) {
    return DateStage.END_OF_MONTH;
  }
  if (isWeekend(now)) {
    return DateStage.END_OF_WEEK;
  }
  return DateStage.NORMAL_DAY;
};

const getStartMessageForGoalFocused = (props: {
  currentPYFAmount: number;
  pyfAmount: number;
  thisWeekSpendingAmount: number;
  thisWeekBudgetAmount: number;
}) => {
  const dateStageForGoalFocus = getDateStage();

  if (dateStageForGoalFocus === DateStage.START_OF_MONTH) {
    return `
    Current PYF amount: ${props.currentPYFAmount}
    Must PYF amount: ${props.pyfAmount}
    
    I'm the system, please start the conversation with user by doing actions:
    - The system tracks whether the user has confirmed their PYF contribution. If not confirmed, the AI continues to prompt daily until confirmation is received
    - If the user has not confirmed PYF by the 5th day of the month, the AI asks for the reason to provide appropriate actionable suggestions:
      - If the user states they haven't received their salary yet, the AI asks for their expected salary date and sets a reminder to prompt them again on that date.
      - If the user states they had an unexpected expense (e.g., paying off last month's debt) and therefore cannot PYF the agreed amount, the AI advises them to cut down on other budget categories instead of reducing their PYF contribution.
    `;
  }

  if (dateStageForGoalFocus === DateStage.END_OF_MONTH) {
    return `
    This week's spending: ${props.thisWeekSpendingAmount}
    This week's budget: ${props.thisWeekBudgetAmount}
    
    I'm the system, please start the conversation with user by doing actions:
    The AI asks the user for their total spending for the last week of the month.
    If the user underspent their budget for the last week, the AI advises them to save the surplus amount to their emergency fund to achieve their goal faster.
    If the user overspent their overall monthly budget, the AI deep dives into which budget categories were overspent and provides appropriate solutions based on the root cause. The AI also helps the user plan their budget for the next month based on the current month's data.
    `;
  }

  if (dateStageForGoalFocus === DateStage.END_OF_WEEK) {
    return `
    This week's spending: ${props.thisWeekSpendingAmount}
    This week's budget: ${props.thisWeekBudgetAmount}
    
    The AI asks the user for their total spending for the past week and prompts them to plan their spendable amount for the upcoming week.
    - If the user has underspent their weekly budget, the remaining amount is added to the next week's budget. For example, if the weekly budget was 1,100,000 VND and spending was 1,000,000 VND, the next week's budget becomes 1,200,000 VND.
    - If the user has overspent their weekly budget, the excess amount is deducted from the next week's budget. For example, if the weekly budget was 1,100,000 VND and spending was 1,500,000 VND, the next week's budget becomes 800,000 VND. The AI advises the user to cook at home for savings and reduce unnecessary spending for that week.
    - If the overspent amount is significantly large, the AI negotiates a revised plan with the user, which may involve deducting from each weekly budget for a set period. The AI emphasizes not dipping into the emergency fund (PYF amount).
    `;
  }

  return `
    This week's spending: ${props.thisWeekSpendingAmount}
    This week's budget: ${props.thisWeekBudgetAmount}
    I'm the system, please start the conversation with user by doing actions:
    - The AI reminds the user of their remaining budget for the current week.
    - If the current week's budget is lower than the default amount (due to previous overspending), the AI advises: "You should ask me before spending something to make sure you won't go over the budget this week."
    - If the weekly budget amount is greater than or equal to the default, the AI asks: "How can I help you today?"
    `;
};

const getStartMessageForDetailTracker = (props: {
  currentPYFAmount: number;
  pyfAmount: number;
}) => {
  const dateStageForGoalFocus = getDateStage();

  if (dateStageForGoalFocus === DateStage.START_OF_MONTH) {
    return `
      Current PYF amount: ${props.currentPYFAmount}
      Must PYF amount: ${props.pyfAmount}
      
      I'm the system, please start the conversation with user by doing actions:
      - The system tracks whether the user has confirmed their PYF contribution. If not confirmed, the AI continues to prompt daily until confirmation is received
      - If the user has not confirmed PYF by the 5th day of the month, the AI asks for the reason to provide appropriate actionable suggestions:
        - If the user states they haven't received their salary yet, the AI asks for their expected salary date and sets a reminder to prompt them again on that date.
        - If the user states they had an unexpected expense (e.g., paying off last month's debt) and therefore cannot PYF the agreed amount, the AI advises them to cut down on other budget categories instead of reducing their PYF contribution.
      `;
  }

  if (dateStageForGoalFocus === DateStage.END_OF_MONTH) {
    return `
      I'm the system, please start the conversation with user by doing actions:
      - The AI displays the budgeting dashboard.
      - If the user has not overspent their overall monthly budget, the AI shows the Goal Dashboard and encourages the user to transfer any surplus amount to their emergency fund to accelerate goal achievement.
      - If the user has overspent their overall monthly budget, the AI performs a deep dive to identify which budget categories were overspent. It then provides appropriate solutions based on the root cause of the overspending.
      - The AI helps the user plan their budget for the next month based on the current month's spending data and performance.
      `;
  }

  return `
      I'm the system, please start the conversation with user by doing actions:
      - The AI displays the budgeting dashboard to help the user control their spending after saving.
      - The AI asks the user to log their spending for the day: "What did you spend today?
      `;
};

const getCurrentWeekSpendingAmount = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string
): Promise<number> => {
  try {
    const now = new Date();

    // Get start and end of current week using date-fns (Monday as start of week)
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // Query budget_transactions joined with transactions for the current week
    const { data: budgetTransactions, error } = await supabaseClient
      .from("budget_transactions")
      .select(
        `
        budget_id,
        transaction_id,
        transactions!inner(
          amount,
          type,
          created_at
        )
      `
      )
      .eq("user_id", userId)
      .eq("transactions.type", "outcome") // Only spending transactions
      .gte("transactions.created_at", weekStart.toISOString())
      .lte("transactions.created_at", weekEnd.toISOString());

    if (error) {
      console.error("Error fetching current week budget spending:", error);
      return 0;
    }

    // Calculate total spending for the week from budget-related transactions
    const totalSpending =
      budgetTransactions?.reduce((sum, budgetTransaction) => {
        const transaction = budgetTransaction.transactions;
        if (
          transaction &&
          typeof transaction === "object" &&
          "amount" in transaction
        ) {
          return sum + Math.abs(transaction.amount); // Use absolute value for spending
        }
        return sum;
      }, 0) || 0;

    return totalSpending;
  } catch (error) {
    console.error("Error in getCurrentWeekSpendingAmount:", error);
    return 0;
  }
};

export const getCurrentMonthDepositToGoal = async (
  supabaseClient: SupabaseClient<Database>,
  userId: string
): Promise<number> => {
  try {
    // Step 1: Get the first goal for the user
    const { data: firstGoal, error: goalError } = await supabaseClient
      .from("goals")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (goalError || !firstGoal) {
      console.error("Error fetching user's first goal:", goalError);
      return 0;
    }

    // Step 2: Get the current month date range using date-fns
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Step 3: Query goal_transactions joined with transactions for income transactions
    const { data: goalTransactions, error: transactionError } =
      await supabaseClient
        .from("goal_transactions")
        .select(
          `
        goal_id,
        transaction_id,
        transactions!inner(
          amount,
          type,
          created_at
        )
      `
        )
        .eq("user_id", userId)
        .eq("goal_id", firstGoal.id)
        .eq("transactions.type", "income") // Only income transactions
        .gte("transactions.created_at", monthStart.toISOString())
        .lte("transactions.created_at", monthEnd.toISOString());

    if (transactionError) {
      console.error(
        "Error fetching goal income transactions:",
        transactionError
      );
      return 0;
    }

    // Step 4: Sum all income amounts for the goal in current month
    const totalDeposits =
      goalTransactions?.reduce((sum, goalTransaction) => {
        const transaction = goalTransaction.transactions;
        if (
          transaction &&
          typeof transaction === "object" &&
          "amount" in transaction
        ) {
          return sum + Math.abs(transaction.amount); // Use absolute value for deposits
        }
        return sum;
      }, 0) || 0;

    return totalDeposits;
  } catch (error) {
    console.error("Error in getCurrentMonthDepositToGoal:", error);
    return 0;
  }
};

export async function GET() {
  const supabase = await createClient<Database>();

  const authUser = await supabase.auth.getUser();

  if (!authUser.data.user?.id) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", authUser.data.user?.id)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "Error fetching user" }, { status: 404 });
  }

  let startMessage = DEFAULT_START_MESSAGE;

  const financialMetadata =
    user.financial_metadata as unknown as FinancialMetadata;

  if (user.budgeting_style === "goal_focused") {
    startMessage = getStartMessageForGoalFocused({
      currentPYFAmount: await getCurrentMonthDepositToGoal(
        supabase,
        user.user_id
      ),
      pyfAmount: financialMetadata.payYourselfFirstAmount,
      thisWeekSpendingAmount: await getCurrentWeekSpendingAmount(
        supabase,
        user.id
      ),
      thisWeekBudgetAmount:
        financialMetadata.weekSpending[getWeekOfMonth(new Date()) - 1]
          .allowToSpend,
    });
  }

  if (user.budgeting_style === "detail_tracker") {
    startMessage = getStartMessageForDetailTracker({
      currentPYFAmount: await getCurrentMonthDepositToGoal(
        supabase,
        user.user_id
      ),
      pyfAmount: financialMetadata.payYourselfFirstAmount,
    });
  }

  return NextResponse.json({
    success: true,
    data: { startMessage },
  });
}
