# Debt Components Documentation

## Type Definitions

```typescript
// Debt card component context
debt: {
  lender: string;        // Name of the lender (e.g., "Bank ABC", "Credit Card")
  purpose: string;       // Purpose of the debt (e.g., "Home Loan", "Car Purchase")
  rate: number;          // Annual interest rate as a percentage
  dueDate: string;       // Due date in ISO format (YYYY-MM-DD)
  amount: number;        // Total debt amount
  currentPaidAmount: number; // Amount already paid
}

// Debt list component context
debts?: {
  lender: string;
  purpose: string;
  rate: number;
  dueDate: string;
  amount: number;
  currentPaidAmount: number;
}[]

// Debt summarize component context
debtTable?: {
  debts: {
    lender: string;
    purpose: string;
    rate: number;
    amount: number;
  }[]
}
```

## Components

### DebtCard

**What it is:** A card component that displays comprehensive debt information with visual progress indicators, status colors, and interactive behavior.

**When to use:**

- Displaying individual debt details in a card format
- Showing debt progress with visual feedback
- Creating interactive debt dashboards where users can click for more details

### DebtList

**What it is:** A container component that renders a list of debt items with empty state handling.

**When to use:**

- Displaying multiple debts in a scrollable list format
- Managing collections of debt items
- Providing empty state feedback when no debts exist

### DebtListItem

**What it is:** A compact list item component for displaying debt information in a horizontal layout.

**When to use:**

- Creating debt lists with less detailed information
- Building compact debt overviews
- When space is limited but multiple debts need to be shown

### DebtTable

**What it is:** A table component for displaying debt information in a structured format with responsive design.

**When to use:**

- Displaying debt summaries in tabular format
- Creating debt reports or overviews
- When users need to compare multiple debts side-by-side
