# Expense CRUD System Usage Examples

This document demonstrates how to use the expense CRUD system that follows the workspace architecture rules.

## 📁 File Structure

```
lib/
├── types/expense.types.ts          # Type definitions
├── services/expense.service.ts     # Service layer (API calls)
└── error-handler.ts               # Updated with expense errors

hooks/expense/
├── use-expense-list.ts            # List expenses
├── use-expense-create.ts          # Create expense
├── use-expense-update.ts          # Update expense
├── use-expense-delete.ts          # Delete expense
├── use-expense.ts                 # Single expense
├── use-expense-summary.ts         # Expense calculations
├── use-expense-management.ts      # Composition hook
└── index.ts                       # Clean exports

app/api/expenses/
├── route.ts                       # GET /api/expenses, POST /api/expenses
└── [id]/route.ts                  # GET, PUT, DELETE /api/expenses/[id]
```

## 🎯 Usage Examples

### 1. Basic Expense List

```tsx
import { useExpenseList } from "@/hooks/expense";

const ExpenseList = () => {
  const { expenses, isLoading, error, refreshExpenses } = useExpenseList();

  if (isLoading) return <div>Loading expenses...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={refreshExpenses}>Refresh</button>
      {expenses.map((expense) => (
        <div key={expense.id}>
          <span>${expense.amount}</span>
          <span>{expense.description}</span>
          <span>{expense.expense_date}</span>
        </div>
      ))}
    </div>
  );
};
```

### 2. Filtered Expense List

```tsx
import { useExpenseList } from "@/hooks/expense";

const BudgetExpenses = ({ budgetId }: { budgetId: string }) => {
  const { expenses, isLoading, error } = useExpenseList({
    budget_id: budgetId,
    limit: 10,
  });

  // Component implementation...
};

const MonthlyExpenses = () => {
  const { expenses, isLoading, error } = useExpenseList({
    from_date: "2024-01-01",
    to_date: "2024-01-31",
  });

  // Component implementation...
};
```

### 3. Create Expense

```tsx
import { useExpenseCreate } from "@/hooks/expense";

const ExpenseCreateForm = () => {
  const { createExpense, isCreating, error, clearError } = useExpenseCreate();

  const handleSubmit = async (data: CreateExpenseRequest) => {
    const result = await createExpense({
      amount: 25.5,
      budget_id: "budget-id-123",
      description: "Coffee and snacks",
      expense_date: "2024-01-15",
      recurring_month: null,
    });

    if (result) {
      // Success - expense created
      console.log("Expense created:", result);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="error">
          {error}
          <button onClick={clearError}>×</button>
        </div>
      )}
      {/* Form fields */}
      <button type="submit" disabled={isCreating}>
        {isCreating ? "Creating..." : "Create Expense"}
      </button>
    </form>
  );
};
```

### 4. Update Expense

```tsx
import { useExpenseUpdate } from "@/hooks/expense";

const ExpenseEditForm = ({ expenseId }: { expenseId: string }) => {
  const { updateExpense, isUpdating, error } = useExpenseUpdate();

  const handleUpdate = async () => {
    const result = await updateExpense(expenseId, {
      amount: 30.0,
      description: "Updated description",
    });

    if (result) {
      // Success - expense updated
    }
  };

  // Component implementation...
};
```

### 5. Delete Expense

```tsx
import { useExpenseDelete } from "@/hooks/expense";

const ExpenseDeleteButton = ({ expenseId }: { expenseId: string }) => {
  const { deleteExpense, isDeleting, error } = useExpenseDelete();

  const handleDelete = async () => {
    const success = await deleteExpense(expenseId);
    if (success) {
      // Success message
    }
  };

  return (
    <>
      {error && <div className="error">{error}</div>}
      <button onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </>
  );
};
```

### 6. Single Expense Detail

```tsx
import { useExpense } from "@/hooks/expense";

const ExpenseDetail = ({ expenseId }: { expenseId: string }) => {
  const { expense, isLoading, error, refreshExpense } = useExpense(expenseId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!expense) return <div>Expense not found</div>;

  return (
    <div>
      <h2>Expense Details</h2>
      <p>Amount: ${expense.amount}</p>
      <p>Description: {expense.description}</p>
      <p>Date: {expense.expense_date}</p>
      <p>Budget: {expense.budget_id}</p>
      <button onClick={refreshExpense}>Refresh</button>
    </div>
  );
};
```

### 7. Expense Summary & Analytics

```tsx
import { useExpenseSummary } from "@/hooks/expense";

const ExpenseSummary = () => {
  const { summary, isLoading, error } = useExpenseSummary({
    from_date: "2024-01-01",
    to_date: "2024-01-31",
  });

  if (isLoading) return <div>Loading summary...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!summary) return <div>No data available</div>;

  return (
    <div>
      <h3>Expense Summary</h3>
      <p>Total Amount: ${summary.total}</p>
      <p>Total Expenses: {summary.count}</p>

      <h4>By Budget</h4>
      {Object.entries(summary.by_budget || {}).map(([budgetId, amount]) => (
        <div key={budgetId}>
          {budgetId}: ${amount}
        </div>
      ))}

      <h4>By Month</h4>
      {Object.entries(summary.by_month || {}).map(([month, amount]) => (
        <div key={month}>
          {month}: ${amount}
        </div>
      ))}
    </div>
  );
};
```

### 8. Complete Expense Management (Composition)

```tsx
import { useExpenseManagement } from "@/hooks/expense";

const ExpenseManagementPage = ({ budgetId }: { budgetId: string }) => {
  const {
    // Data
    expenses,
    expenseSummary,
    currentExpense,

    // Operations
    createExpenseAndRefresh,
    updateExpenseAndRefresh,
    deleteExpenseAndRefresh,

    // States
    isLoading,
    error,
    clearAllErrors,

    // Individual hooks access
    list,
    create,
    update,
    delete: deleteHook,
  } = useExpenseManagement({
    listQuery: { budget_id: budgetId, limit: 20 },
    summaryQuery: { budget_id: budgetId },
  });

  const handleCreateExpense = async (data: CreateExpenseRequest) => {
    const result = await createExpenseAndRefresh(data);
    if (result) {
      // Automatically refreshes list and summary
      console.log("Expense created and data refreshed");
    }
  };

  return (
    <div>
      {error && (
        <div className="error">
          {error}
          <button onClick={clearAllErrors}>Clear Errors</button>
        </div>
      )}

      <div className="summary">
        <h3>Summary</h3>
        <p>Total: ${expenseSummary?.total || 0}</p>
        <p>Count: {expenseSummary?.count || 0}</p>
      </div>

      <div className="expenses">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id}>
              <span>${expense.amount}</span>
              <span>{expense.description}</span>
              <button
                onClick={() =>
                  updateExpenseAndRefresh(expense.id, {
                    amount: expense.amount + 1,
                  })
                }
              >
                +$1
              </button>
              <button onClick={() => deleteExpenseAndRefresh(expense.id)}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
```

## 🔧 Advanced Usage

### Custom Query Hook

```tsx
import { useExpenseList } from "@/hooks/expense";
import { useMemo } from "react";

const useRecentExpenses = (days: number = 30) => {
  const fromDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split("T")[0];
  }, [days]);

  return useExpenseList({
    from_date: fromDate,
    to_date: new Date().toISOString().split("T")[0],
  });
};

// Usage
const RecentExpenses = () => {
  const { expenses, isLoading, error } = useRecentExpenses(7); // Last 7 days
  // ...
};
```

### Error Handling

```tsx
import { useExpenseCreate } from "@/hooks/expense";
import { ErrorCode } from "@/lib/errors";

const ExpenseForm = () => {
  const { createExpense, error } = useExpenseCreate();

  const handleSubmit = async (data: CreateExpenseRequest) => {
    const result = await createExpense(data);

    if (!result && error) {
      // Handle specific errors
      if (error.includes("future")) {
        // Handle future date error
      } else if (error.includes("amount")) {
        // Handle amount validation error
      }
    }
  };

  // ...
};
```

## 📊 Type Safety

All hooks return properly typed data:

```tsx
import type {
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseSummary,
} from "@/hooks/expense";

// All types are exported for external use
const expense: Expense = {
  id: "uuid",
  amount: 25.5,
  budget_id: "budget-id",
  description: "Coffee",
  expense_date: "2024-01-15",
  recurring_month: null,
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-15T10:00:00Z",
  user_id: "user-uuid",
};
```

## 🚀 Best Practices

1. **Use single-responsibility hooks** for specific operations
2. **Use composition hook** (`useExpenseManagement`) for complex pages
3. **Handle errors gracefully** with user-friendly messages
4. **Leverage TypeScript** for type safety
5. **Refresh data** after mutations using composition hooks
6. **Clear errors** when appropriate
7. **Use filtering** for better UX (budget-specific, date ranges)

This system follows the workspace architecture rules with proper separation of concerns, centralized error handling, and clean abstractions.
