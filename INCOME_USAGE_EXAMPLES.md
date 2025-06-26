# Income CRUD System Usage Examples

This document demonstrates how to use the income CRUD system that follows the workspace architecture rules.

## 📁 File Structure

```
lib/
├── types/income.types.ts           # Type definitions
├── services/income.service.ts      # Service layer (API calls)
└── error-handler.ts               # Updated with income errors

hooks/income/
├── use-income-list.ts             # List incomes
├── use-income-create.ts           # Create income
├── use-income-update.ts           # Update income
├── use-income-delete.ts           # Delete income
├── use-income.ts                  # Single income
├── use-income-summary.ts          # Income calculations
├── use-income-management.ts       # Composition hook
└── index.ts                       # Clean exports

app/api/incomes/
├── route.ts                       # GET /api/incomes, POST /api/incomes
└── [id]/route.ts                  # GET, PUT, DELETE /api/incomes/[id]
```

## 🎯 Usage Examples

### 1. Basic Income List

```tsx
import { useIncomeList } from "@/hooks/income";

const IncomeList = () => {
  const { incomes, isLoading, error, refreshIncomes } = useIncomeList();

  if (isLoading) return <div>Loading incomes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={refreshIncomes}>Refresh</button>
      {incomes.map((income) => (
        <div key={income.id}>
          <span>${income.amount}</span>
          <span>{income.description}</span>
          <span>{income.date}</span>
          {income.is_recurring && <span>🔄 Recurring</span>}
          {income.pay_yourself_percent && (
            <span>💰 {income.pay_yourself_percent}%</span>
          )}
        </div>
      ))}
    </div>
  );
};
```

### 2. Filtered Income List

```tsx
import { useIncomeList } from "@/hooks/income";

const RecurringIncomes = () => {
  const { incomes, isLoading, error } = useIncomeList({
    is_recurring: true,
    limit: 10,
  });

  // Component implementation...
};

const MonthlyIncomes = () => {
  const { incomes, isLoading, error } = useIncomeList({
    from_date: "2024-01-01",
    to_date: "2024-01-31",
  });

  // Component implementation...
};
```

### 3. Create Income

```tsx
import { useIncomeCreate } from "@/hooks/income";

const IncomeCreateForm = () => {
  const { createIncome, isCreating, error, clearError } = useIncomeCreate();

  const handleSubmit = async (data: CreateIncomeRequest) => {
    const result = await createIncome({
      amount: 5000.0,
      date: "2024-01-15",
      description: "Monthly salary",
      is_recurring: true,
      pay_yourself_percent: 20,
    });

    if (result) {
      // Success - income created
      console.log("Income created:", result);
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
        {isCreating ? "Creating..." : "Create Income"}
      </button>
    </form>
  );
};
```

### 4. Update Income

```tsx
import { useIncomeUpdate } from "@/hooks/income";

const IncomeEditForm = ({ incomeId }: { incomeId: string }) => {
  const { updateIncome, isUpdating, error } = useIncomeUpdate();

  const handleUpdate = async () => {
    const result = await updateIncome(incomeId, {
      amount: 5500.0,
      description: "Salary increase",
      pay_yourself_percent: 25,
    });

    if (result) {
      // Success - income updated
    }
  };

  // Component implementation...
};
```

### 5. Delete Income

```tsx
import { useIncomeDelete } from "@/hooks/income";

const IncomeDeleteButton = ({ incomeId }: { incomeId: string }) => {
  const { deleteIncome, isDeleting, error } = useIncomeDelete();

  const handleDelete = async () => {
    const success = await deleteIncome(incomeId);
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

### 6. Single Income Detail

```tsx
import { useIncome } from "@/hooks/income";

const IncomeDetail = ({ incomeId }: { incomeId: string }) => {
  const { income, isLoading, error, refreshIncome } = useIncome(incomeId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!income) return <div>Income not found</div>;

  return (
    <div>
      <h2>Income Details</h2>
      <p>Amount: ${income.amount}</p>
      <p>Description: {income.description}</p>
      <p>Date: {income.date}</p>
      <p>Recurring: {income.is_recurring ? "Yes" : "No"}</p>
      {income.pay_yourself_percent && (
        <p>Pay Yourself: {income.pay_yourself_percent}%</p>
      )}
      <button onClick={refreshIncome}>Refresh</button>
    </div>
  );
};
```

### 7. Income Summary & Analytics

```tsx
import { useIncomeSummary } from "@/hooks/income";

const IncomeSummary = () => {
  const { summary, isLoading, error } = useIncomeSummary({
    from_date: "2024-01-01",
    to_date: "2024-01-31",
  });

  if (isLoading) return <div>Loading summary...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!summary) return <div>No data available</div>;

  return (
    <div>
      <h3>Income Summary</h3>
      <p>Total Income: ${summary.total}</p>
      <p>Total Entries: {summary.count}</p>

      <div className="income-breakdown">
        <p>Recurring Income: ${summary.recurring_total || 0}</p>
        <p>One-time Income: ${summary.one_time_total || 0}</p>
        {summary.average_pay_yourself_percent && (
          <p>
            Average Pay Yourself:{" "}
            {summary.average_pay_yourself_percent.toFixed(1)}%
          </p>
        )}
      </div>

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

### 8. Complete Income Management (Composition)

```tsx
import { useIncomeManagement } from "@/hooks/income";

const IncomeManagementPage = () => {
  const {
    // Data
    incomes,
    incomeSummary,
    currentIncome,

    // Operations
    createIncomeAndRefresh,
    updateIncomeAndRefresh,
    deleteIncomeAndRefresh,

    // States
    isLoading,
    error,
    clearAllErrors,

    // Individual hooks access
    list,
    create,
    update,
    delete: deleteHook,
  } = useIncomeManagement({
    listQuery: { limit: 20 },
    summaryQuery: { from_date: "2024-01-01" },
  });

  const handleCreateIncome = async (data: CreateIncomeRequest) => {
    const result = await createIncomeAndRefresh(data);
    if (result) {
      // Automatically refreshes list and summary
      console.log("Income created and data refreshed");
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
        <p>Total: ${incomeSummary?.total || 0}</p>
        <p>Count: {incomeSummary?.count || 0}</p>
        <p>Recurring: ${incomeSummary?.recurring_total || 0}</p>
        <p>One-time: ${incomeSummary?.one_time_total || 0}</p>
      </div>

      <div className="incomes">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          incomes.map((income) => (
            <div key={income.id}>
              <span>${income.amount}</span>
              <span>{income.description}</span>
              {income.is_recurring && <span>🔄</span>}
              <button
                onClick={() =>
                  updateIncomeAndRefresh(income.id, {
                    amount: income.amount + 100,
                  })
                }
              >
                +$100
              </button>
              <button onClick={() => deleteIncomeAndRefresh(income.id)}>
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
import { useIncomeList } from "@/hooks/income";
import { useMemo } from "react";

const useRecurringIncomes = () => {
  return useIncomeList({
    is_recurring: true,
  });
};

const useRecentIncomes = (days: number = 30) => {
  const fromDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split("T")[0];
  }, [days]);

  return useIncomeList({
    from_date: fromDate,
    to_date: new Date().toISOString().split("T")[0],
  });
};

// Usage
const RecurringIncomes = () => {
  const { incomes, isLoading, error } = useRecurringIncomes();
  // ...
};

const RecentIncomes = () => {
  const { incomes, isLoading, error } = useRecentIncomes(7); // Last 7 days
  // ...
};
```

### Pay Yourself Percentage Calculator

```tsx
import { useIncomeSummary } from "@/hooks/income";

const PayYourselfTracker = () => {
  const { summary } = useIncomeSummary();

  const calculateTotalSavings = () => {
    if (!summary) return 0;

    // Calculate total potential savings based on pay yourself percentages
    let totalSavings = 0;
    // This would require detailed income data with pay yourself percentages
    // You can extend the service to provide this calculation

    return totalSavings;
  };

  return (
    <div>
      <h3>Pay Yourself Tracker</h3>
      {summary?.average_pay_yourself_percent && (
        <p>
          Average Pay Yourself Rate:{" "}
          {summary.average_pay_yourself_percent.toFixed(1)}%
        </p>
      )}
      <p>Recommended Savings: ${calculateTotalSavings()}</p>
    </div>
  );
};
```

### Error Handling

```tsx
import { useIncomeCreate } from "@/hooks/income";
import { ErrorCode } from "@/lib/errors";

const IncomeForm = () => {
  const { createIncome, error } = useIncomeCreate();

  const handleSubmit = async (data: CreateIncomeRequest) => {
    const result = await createIncome(data);

    if (!result && error) {
      // Handle specific errors
      if (error.includes("description is required")) {
        // Handle description validation error
      } else if (error.includes("amount must be greater")) {
        // Handle amount validation error
      } else if (error.includes("pay yourself percent")) {
        // Handle percentage validation error
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
  Income,
  CreateIncomeRequest,
  UpdateIncomeRequest,
  IncomeSummary,
} from "@/hooks/income";

// All types are exported for external use
const income: Income = {
  id: "uuid",
  amount: 5000.0,
  date: "2024-01-15",
  description: "Monthly salary",
  is_recurring: true,
  pay_yourself_percent: 20,
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-15T10:00:00Z",
  user_id: "user-uuid",
};
```

## 🚀 Best Practices

1. **Use single-responsibility hooks** for specific operations
2. **Use composition hook** (`useIncomeManagement`) for complex pages
3. **Handle errors gracefully** with user-friendly messages
4. **Leverage TypeScript** for type safety
5. **Refresh data** after mutations using composition hooks
6. **Clear errors** when appropriate
7. **Use filtering** for better UX (recurring vs one-time, date ranges)
8. **Track pay yourself percentages** for financial planning
9. **Separate recurring from one-time** income for better analytics

## 💡 Income-Specific Features

### Recurring Income Tracking

- Use `is_recurring` flag to differentiate income types
- Filter by recurring status for planning
- Calculate predictable vs variable income

### Pay Yourself First Strategy

- Use `pay_yourself_percent` for automatic savings calculation
- Track average savings rate across all income sources
- Set goals for pay yourself percentages

### Financial Planning

- Use date filtering for monthly/yearly income analysis
- Compare recurring vs one-time income trends
- Calculate total potential savings based on pay yourself percentages

This system follows the workspace architecture rules with proper separation of concerns, centralized error handling, and clean abstractions specific to income management.
