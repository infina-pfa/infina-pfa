# Onboarding Budget Allocation Flow Implementation

## Overview

This document describes the implementation of the comprehensive onboarding budget allocation flow that begins after the "Pay Yourself First" principle explanation. The flow branches into two distinct paths based on user philosophy selection.

## Prerequisites

Before this flow begins, the following data must be collected:
- `user_id`: The unique identifier for the user
- `user_income`: The user's total monthly income  
- `emergency_fund_amount`: Pre-calculated monthly contribution to emergency fund

## Flow Implementation

### Step 1: Philosophy Selection

**Component**: `philosophy_selection`
**Location**: `components/onboarding/chat/components/philosophy-selection.tsx`

**Process**:
1. AI explains "Understanding Budget Priorities" concept
2. Presents two budgeting philosophies:
   - **Simplicity-Focused** (`goal_focused`): High-level overview, minimal tracking
   - **Detail-Oriented** (`detail_tracker`): Meticulous expense category tracking
3. User selects their preferred approach
4. Selection is saved to database in `users.budgeting_style` field
5. AI branches to appropriate flow based on selection

### Branch A: Simplicity-Focused Flow (`goal_focused`)

**Trigger**: User selected "goal_focused" philosophy

#### A1. Display Budget Allocation Tool
- **Component**: `budget_allocation_tool`
- **Configuration**: 
  - Emergency Fund: Pre-filled and locked from prerequisites
  - Living Expenses: Single consolidated amount (user adjustable)
  - Free to Spend: Remaining discretionary amount (user adjustable)
- **Validation**: `living_expenses + free_to_spend + emergency_fund_amount = user_income`

#### A2. User Confirmation
- User adjusts allocation percentages
- Real-time validation ensures 100% allocation
- User clicks "Confirm" button

#### A3. Database Operation
**API Endpoint**: `POST /api/budgets/allocation`
**Operation**: UPSERT on `budgets` table
**Records Created**:
```sql

-- Living Expenses (Priority 2) - Single consolidated record
INSERT INTO budgets (user_id, month, year, name, category, amount, color, icon)  
VALUES (user_id, current_month, current_year, 'Living Expenses', 'essential', living_expenses_amount, '#2ECC71', 'home');

-- Free to Spend (Priority 3)
INSERT INTO budgets (user_id, month, year, name, category, amount, color, icon)
VALUES (user_id, current_month, current_year, 'Free to Spend', 'discretionary', free_to_spend_amount, '#FF9800', 'credit-card');
```

#### A4. Proceed to Next Module
- Transition to "Choosing Where to Keep Your Emergency Fund" module

### Branch B: Detail-Oriented Flow (`detail_tracker`)

**Trigger**: User selected "detail_tracker" philosophy

#### B1. Collect Detailed Living Expenses
- **Component**: `expense_categories`
- **Categories Collected**:
  - `house_rent`: Housing/Rent expenses
  - `food`: Food & Dining expenses  
  - `transportation`: Transportation costs
  - `utilities`: Utility bills
  - `other_essentials`: Other essential expenses

#### B2. Calculate Total Living Expenses
- `total_living_expenses = house_rent + food + transportation + utilities + other_essentials`
- Stored in component context for next step

#### B3. Display Pre-filled Budget Allocation Tool
- **Component**: `budget_allocation_tool` (read-only mode)
- **Auto-filled Values**:
  - Emergency Fund: `emergency_fund_amount` (locked)
  - Living Expenses: `total_living_expenses` (calculated from detailed categories)
  - Free to Spend: `user_income - emergency_fund_amount - total_living_expenses`

#### B4. User Review & Confirmation
- User reviews complete "Monthly Budget Allocation"
- All values are read-only/pre-calculated
- User clicks "Confirm" button

#### B5. Database Operation
**API Endpoint**: `POST /api/budgets/allocation`
**Operation**: UPSERT on `budgets` table
**Records Created**:
```sql

-- Individual Living Expense Categories (Priority 2)
INSERT INTO budgets (user_id, month, year, name, category, amount, color, icon)
VALUES (user_id, current_month, current_year, 'Housing & Rent', 'essential', house_rent_amount, '#0055FF', 'home');

INSERT INTO budgets (user_id, month, year, name, category, amount, color, icon)
VALUES (user_id, current_month, current_year, 'Food & Dining', 'essential', food_amount, '#FF9800', 'utensils');

INSERT INTO budgets (user_id, month, year, name, category, amount, color, icon)
VALUES (user_id, current_month, current_year, 'Transportation', 'essential', transportation_amount, '#2ECC71', 'car');

INSERT INTO budgets (user_id, month, year, name, category, amount, color, icon)
VALUES (user_id, current_month, current_year, 'Utilities', 'essential', utilities_amount, '#FFC107', 'zap');

INSERT INTO budgets (user_id, month, year, name, category, amount, color, icon)
VALUES (user_id, current_month, current_year, 'Other Essentials', 'essential', other_essentials_amount, '#F44336', 'shopping-cart');

-- Free to Spend (Priority 3)
INSERT INTO budgets (user_id, month, year, name, category, amount, color, icon)
VALUES (user_id, current_month, current_year, 'Free to Spend', 'discretionary', free_to_spend_amount, '#FF9800', 'credit-card');
```

#### B6. Proceed to Next Module
- Transition to "Choosing Where to Keep Your Emergency Fund" module

## Technical Implementation Details

### API Endpoints

#### `/api/budgets/allocation` (POST)
**Purpose**: Create budget records from onboarding allocation data
**Request Body**:
```typescript
{
  allocationData: {
    emergencyFund: number;    // Percentage
    livingExpenses: number;   // Percentage  
    freeToSpend: number;      // Percentage
  };
  monthlyIncome: number;
  budgetingStyle: "goal_focused" | "detail_tracker";
  expenseBreakdown?: Record<string, number>; // Only for detail_tracker
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    budgets: Budget[];
    budgetingStyle: string;
    allocation: AllocationData;
    totalBudgets: number;
  };
}
```

### Database Schema

#### `budgets` Table
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT DEFAULT 'wallet',
  color TEXT DEFAULT '#0055FF',
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `users` Table (relevant fields)
```sql
ALTER TABLE users ADD COLUMN budgeting_style budgeting_style;
```

### Component Flow

1. **Philosophy Selection** → Sets `budgeting_style` in database
2. **Branch A (Simplicity)**: Direct to Budget Allocation Tool
3. **Branch B (Detail)**: Expense Categories → Budget Allocation Tool
4. **Budget Allocation Tool**: Creates actual budget records in database
5. **Next Module**: Emergency Fund storage guidance

### Error Handling

- **Validation**: Real-time validation ensures 100% allocation
- **Database Errors**: Graceful handling with user-friendly messages
- **Duplicate Prevention**: Existing budgets are deleted before creating new ones
- **Transaction Safety**: All operations wrapped in try-catch blocks

### Translation Support

All user-facing text supports Vietnamese and English through the i18n system:
- Component titles and descriptions
- Budget category names  
- Validation messages
- User confirmation messages

## Verification Checklist

✅ **Philosophy Selection**: Saves `budgeting_style` to database
✅ **Branch A (Simplicity)**: Creates 2 budget records (Living, Free)
✅ **Branch B (Detail)**: Creates individual category records + Free
✅ **Database Operations**: UPSERT prevents duplicates
✅ **Validation**: 100% allocation enforced
✅ **Emergency Fund**: Always locked at predetermined amount
✅ **User Confirmation**: Required before database operations
✅ **Error Handling**: Comprehensive error management
✅ **Translation**: Full i18n support
✅ **Next Steps**: Proceeds to Emergency Fund guidance

This implementation exactly matches the user's requirements for branching onboarding flow with proper database operations. 