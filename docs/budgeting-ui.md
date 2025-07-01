# Budgeting UI Documentation

## Overview

This document describes the budgeting interface design and functionality based on the Vietnamese mobile application screenshot. The interface follows Infina's flat design principles with a clean, borderless layout.

## Screen Layout

### Header Section

- **Title**: "Chi tiêu" (Expenses/Spending)
- **Left**: Hamburger menu icon (☰) for navigation
- **Right**: User profile avatar
- **Design**: Clean header with white background, centered title using Nunito font

### Main Content Areas

#### 1. Spending Overview Section

- **Label**: "Tổng quan chi tiêu" (Spending Overview)
- **Display**: Large numerical format showing current vs. total budget
- **Format**: `4,000,000đ/20,000,000đ` (4M VND spent out of 20M VND total)
- **Typography**: Bold primary text with gray secondary text for total
- **Design**: Flat display with clear typographic hierarchy

#### 2. Budget Categories Section

**Header**: "Danh mục chi tiêu" (Expense Categories)
**Action Button**: "+ Thêm mới" (Add New) - positioned top-right with primary blue color

**Category Items Structure**:
Each category card contains:

- **Icon**: Relevant category icon (electricity ⚡, house 🏠)
- **Category Name**: Vietnamese category name
- **Spending Status**: "Đã chi X/Y,000,000đ" (Spent X out of Y million VND)
- **Remaining Amount**: "Còn lại Z,000,000đ" (Remaining Z million VND)
- **Progress Bar**: Visual representation of spending vs. budget
  - Blue color `#0055FF` for spent amount
  - Light gray background for remaining amount

**Current Categories**:

1. **Tiền điện** (Electricity)

   - Spent: 0/200,000đ
   - Remaining: 200,000đ
   - Progress: 0% (full gray bar)

2. **Tiền nhà** (Housing/Rent)
   - Spent: 0/3,500,000đ
   - Remaining: 3,500,000đ
   - Progress: 0% (full gray bar)

#### 3. Recent Expenses Section

**Header**: "Chi tiêu gần đây" (Recent Expenses)
**Action Link**: "Xem tất cả lịch sử >" (View All History) - right-aligned with primary blue color

**Transaction Items Structure**:
Each transaction displays:

- **Transaction Name**: Vietnamese description
- **Amount**: Large formatted number with VND currency
- **Category**: "Ghi chú" (Note) label
- **Date**: DD/MM/YYYY format

**Current Transactions**:

1. **Tích lũy Mua nhà** (Home Savings)

   - Amount: 50,000,000đ
   - Date: 20/06/2025

2. **Tích lũy Quỹ dự phòng** (Emergency Fund Savings)

   - Amount: 250,000,000đ
   - Date: 20/05/2025

3. **Trả nợ** (Debt Payment)
   - Amount: 50,000,000đ
   - Date: 20/04/2025

## Design Specifications

### Color Palette

- **Primary Blue**: `#0055FF` (progress bars, action buttons, links)
- **Background**: `#F6F7F9` (app background)
- **Text Primary**: Dark gray/black for main content
- **Text Secondary**: `#666666` for labels and secondary information
- **Card Background**: White `#FFFFFF`

### Typography

- **Font Family**: Nunito (as per brand guidelines)
- **Capitalization**: First letter capitalization only
- **Hierarchy**:
  - Large numbers for amounts
  - Medium text for category names
  - Small text for labels and dates

### Component Patterns

#### Progress Bar Component

- **Track**: Light gray background `#E0E0E0`
- **Fill**: Primary blue `#0055FF`
- **Height**: Consistent thin height (~4px)
- **Rounded**: Slightly rounded corners
- **Animation**: Smooth fill animation based on percentage

#### Category Card Component

- **Layout**: Horizontal layout with icon, text content, and amount
- **Background**: White with subtle separation via whitespace
- **Spacing**: Consistent padding and margins
- **States**: Default, hover (subtle background tint)

#### Transaction Item Component

- **Layout**: Two-column layout (description left, amount right)
- **Metadata**: Date and category below main content
- **Alignment**: Left-aligned description, right-aligned amounts
- **Typography**: Clear hierarchy with amount emphasis

### Accessibility Considerations

- **Screen Reader Support**: All amounts should include currency context
- **Touch Targets**: Minimum 44px touch target size for buttons
- **Color Contrast**: Ensure sufficient contrast ratios for text
- **Internationalization**: All text must support Vietnamese and English translations

### Responsive Behavior

- **Mobile First**: Design optimized for mobile viewport
- **Content Spacing**: Generous whitespace for easy touch interaction
- **Scrolling**: Vertical scroll for additional categories/transactions
- **Safe Areas**: Respect device safe areas and notches

## Implementation Notes

### Translation Keys Required

Based on the Vietnamese text shown, the following translation keys need to be implemented:

```typescript
// budgeting.ts
export const budgetingEn = {
  // Header
  pageTitle: "Expenses",

  // Overview Section
  spendingOverview: "Spending Overview",

  // Categories Section
  expenseCategories: "Expense Categories",
  addNew: "Add New",
  spent: "Spent",
  remaining: "Remaining",

  // Category Names
  electricity: "Electricity",
  housing: "Housing",

  // Recent Expenses
  recentExpenses: "Recent Expenses",
  viewAllHistory: "View All History",
  note: "Note",

  // Transaction Types
  homeSavings: "Home Savings",
  emergencyFund: "Emergency Fund Savings",
  debtPayment: "Debt Payment",
};

export const budgetingVi = {
  // Header
  pageTitle: "Chi tiêu",

  // Overview Section
  spendingOverview: "Tổng quan chi tiêu",

  // Categories Section
  expenseCategories: "Danh mục chi tiêu",
  addNew: "Thêm mới",
  spent: "Đã chi",
  remaining: "Còn lại",

  // Category Names
  electricity: "Tiền điện",
  housing: "Tiền nhà",

  // Recent Expenses
  recentExpenses: "Chi tiêu gần đây",
  viewAllHistory: "Xem tất cả lịch sử",
  note: "Ghi chú",

  // Transaction Types
  homeSavings: "Tích lũy Mua nhà",
  emergencyFund: "Tích lũy Quỹ dự phòng",
  debtPayment: "Trả nợ",
};
```

### Component Structure

The page should be broken down into focused, single-responsibility components:

- `BudgetingHeader` - Header with navigation and profile
- `SpendingOverview` - Total spending display
- `BudgetCategoriesList` - Categories with progress bars
- `BudgetCategoryCard` - Individual category item
- `RecentExpensesList` - Recent transactions list
- `ExpenseItem` - Individual transaction item
- `ProgressBar` - Reusable progress visualization
- `AddNewButton` - Styled action button

This UI design emphasizes clarity, accessibility, and follows Infina's flat design principles with effective use of color, typography, and spacing for a clean financial management experience.
