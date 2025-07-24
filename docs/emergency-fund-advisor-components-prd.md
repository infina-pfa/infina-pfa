# Emergency Fund Advisor - Missing Components PRD

## 📋 Product Requirements Document
**Version:** 1.0  
**Date:** January 2025  
**Project:** Infina PFA - Emergency Fund Advisor Components  

---

## 🎯 Executive Summary

This PRD outlines the missing UI components required for the Emergency Fund Advisor AI to function according to its system prompt specifications. The AI currently lacks 7 critical components needed to execute the three main behavioral scenarios: Start of Month, End of Month, and Normal Day interactions.

## 🔍 Problem Statement

The Emergency Fund Advisor system prompt defines specific UI components that the AI should activate during different scenarios, but these components are not yet implemented:

- **Start of Month:** Requires Goal Dashboard and Pay Yourself First Confirmation
- **End of Month:** Requires Monthly Budget Analysis, Surplus Allocation, and Next Month Planner  
- **Normal Day:** Requires Budgeting Dashboard for daily spending control
- **All Scenarios:** Need Emergency Fund Tracker for progress visibility

## 🏗️ Technical Architecture

### Component Integration Pattern
```typescript
// Each component follows this structure:
1. ChatComponentId enum addition
2. Component definition in tools/definitions.ts
3. React component in components/chat/
4. Message wrapper component for chat integration
5. SWR hook for data fetching (if needed)
```

### Data Flow
```
AI System Prompt → Tool Call → Component Render → User Interaction → MCP Tools → Database Update
```

---

## 📦 Component Specifications

### 1. **GOAL_DASHBOARD Component**

**Priority:** Critical (Phase 1)  
**Scenario Usage:** Start of Month, End of Month  

#### Functional Requirements
- Display Emergency Fund progress as visual progress bar/ring
- Show current amount vs target (3 months of income)
- Calculate and display months of coverage currently achieved
- Show projected completion date based on current savings rate
- Display motivational progress messages
- Quick action button to add money to fund

#### Technical Requirements
```typescript
interface GoalDashboardData {
  currentAmount: number;
  targetAmount: number; // 3 months of income
  monthsOfCoverage: number;
  progressPercentage: number;
  projectedCompletionDate: string;
  monthlySavingsRate: number;
}
```

#### UI/UX Requirements
- **Design:** Flat, borderless design following Infina UI guidelines
- **Colors:** Primary blue (#0055FF) for progress, green (#2ECC71) for positive feedback
- **Typography:** Nunito font family
- **Layout:** Circular progress indicator with key metrics below
- **Responsive:** Mobile-first design, works on all screen sizes

---

### 2. **PAY_YOURSELF_FIRST_CONFIRMATION Component**

**Priority:** Critical (Phase 1)  
**Scenario Usage:** Start of Month (Day 1)  

#### Functional Requirements
- Display recommended monthly Emergency Fund contribution
- Input field for user to enter actual amount transferred
- Quick action buttons: "Đã chuyển", "Chưa chuyển", "Nhắc tôi sau"
- Confirmation logic that updates goal progress
- Integration with goal management MCP tools

#### Technical Requirements
```typescript
interface PayYourselfFirstData {
  recommendedAmount: number;
  userInput: number;
  status: 'pending' | 'completed' | 'postponed';
  dueDate: string;
}
```

#### UI/UX Requirements
- **Input:** Money input component with VND formatting
- **Buttons:** Primary action style for "Đã chuyển"
- **Feedback:** Success message on completion
- **Validation:** Ensure positive number input

---

### 3. **BUDGETING_DASHBOARD Component**

**Priority:** Important (Phase 2)  
**Scenario Usage:** Normal Day, End of Month  

#### Functional Requirements
- Overview of current month's budget performance
- Category-wise spending vs limits with progress bars
- Warning indicators for categories near limit (>80%)
- Quick expense logging interface
- Daily/weekly spending trend mini-chart

#### Technical Requirements
```typescript
interface BudgetingDashboardData {
  monthlyBudgets: Array<{
    categoryId: string;
    categoryName: string;
    limit: number;
    spent: number;
    remaining: number;
    warningThreshold: number;
  }>;
  totalSpent: number;
  totalBudget: number;
  dailyAverage: number;
  weeklyTrend: number[];
}
```

#### UI/UX Requirements
- **Layout:** Card-based layout for each budget category
- **Progress Bars:** Color-coded (green: safe, yellow: warning, red: exceeded)
- **Quick Actions:** Floating action button for expense logging
- **Charts:** Simple line chart for trend visualization

---

### 4. **MONTHLY_BUDGET_ANALYSIS Component**

**Priority:** Important (Phase 2)  
**Scenario Usage:** End of Month  

#### Functional Requirements
- Analyze if user overspent in current month
- Breakdown of overspent categories with amounts
- List of largest expenses in the month
- Comparison with previous month performance
- Actionable suggestions for improvement

#### Technical Requirements
```typescript
interface MonthlyAnalysisData {
  overspentAmount: number;
  isOverspent: boolean;
  overspentCategories: Array<{
    categoryName: string;
    overspentAmount: number;
    percentage: number;
  }>;
  largestExpenses: Array<{
    description: string;
    amount: number;
    date: string;
    category: string;
  }>;
  previousMonthComparison: {
    spendingDifference: number;
    improvementAreas: string[];
  };
}
```

#### UI/UX Requirements
- **Conditional Display:** Different layouts for overspent vs under-budget
- **Data Visualization:** Bar charts for category breakdown
- **Actionable Items:** Clickable suggestions that trigger relevant tools

---

### 5. **SURPLUS_ALLOCATION Component**

**Priority:** Important (Phase 2)  
**Scenario Usage:** End of Month (when not overspent)  

#### Functional Requirements
- Calculate surplus money from current month
- Slider to allocate percentage to Emergency Fund
- Preview of new Emergency Fund total
- One-click "Add All to Emergency Fund" action
- Impact visualization (new months of coverage)

#### Technical Requirements
```typescript
interface SurplusAllocationData {
  surplusAmount: number;
  currentEmergencyFund: number;
  allocationAmount: number;
  newEmergencyFundTotal: number;
  newMonthsOfCoverage: number;
  progressImpact: number; // percentage points gained
}
```

#### UI/UX Requirements
- **Interactive Slider:** Real-time preview updates
- **Visual Impact:** Before/after progress comparison
- **Quick Actions:** Prominent "Boost Emergency Fund" button

---

### 6. **NEXT_MONTH_PLANNER Component**

**Priority:** Lower (Phase 3)  
**Scenario Usage:** End of Month  

#### Functional Requirements
- Copy current month's budget as starting point
- Suggest adjustments based on current month's performance
- Auto-calculate recommended Emergency Fund contribution
- Allow manual adjustment of category budgets
- Save new budget for next month

#### Technical Requirements
```typescript
interface NextMonthPlannerData {
  currentMonthBudgets: BudgetCategory[];
  suggestedAdjustments: Array<{
    categoryId: string;
    currentAmount: number;
    suggestedAmount: number;
    reason: string;
  }>;
  recommendedEmergencyFundContribution: number;
}
```

---

### 7. **EMERGENCY_FUND_TRACKER Component**

**Priority:** Lower (Phase 3)  
**Scenario Usage:** Always available, all scenarios  

#### Functional Requirements
- Compact view of Emergency Fund progress
- Visual progress indicator (ring or bar)
- Current months of coverage
- Quick "Add Money" action
- Can be embedded in other components

#### Technical Requirements
```typescript
interface EmergencyFundTrackerData {
  currentAmount: number;
  targetAmount: number;
  monthsOfCoverage: number;
  progressPercentage: number;
  isCompact: boolean; // for different display modes
}
```

---

## 🔄 Integration Requirements

### MCP Tools Integration
All components must integrate with existing MCP tools:
- `goal-management`: For Emergency Fund operations
- `budget-management`: For budget data and expense logging

### SWR Data Fetching
Each component should use the existing SWR pattern:
```typescript
// Example hook structure
export const useGoalDashboardSWR = () => {
  return useSWR(['goal-dashboard'], goalService.getDashboardData, {
    refreshInterval: 30000, // Refresh every 30 seconds
  });
};
```

### Translation Support
All text must be internationalized:
- Vietnamese (primary)
- English (secondary)
- Use `useAppTranslation` hook
- Follow existing naming conventions

---

## 🚀 Implementation Phases

### Phase 1: Critical Components (Week 1)
1. **GOAL_DASHBOARD** - Core progress tracking
2. **PAY_YOURSELF_FIRST_CONFIRMATION** - Start of month flow

### Phase 2: Analysis Components (Week 2)
3. **MONTHLY_BUDGET_ANALYSIS** - End of month analysis
4. **SURPLUS_ALLOCATION** - Surplus money management

### Phase 3: Daily Operations (Week 3)
5. **BUDGETING_DASHBOARD** - Daily spending control

### Phase 4: Planning Tools (Week 4)
6. **NEXT_MONTH_PLANNER** - Budget planning
7. **EMERGENCY_FUND_TRACKER** - Always-available tracker

---

## 📏 Success Metrics

### Technical Metrics
- All 7 components render without errors
- Integration with MCP tools works seamlessly
- SWR data fetching performs optimally
- Mobile responsiveness achieved

### User Experience Metrics
- AI can execute all system prompt scenarios
- Components provide clear, actionable information
- User interactions flow smoothly between components
- Emergency Fund completion rate increases

### Performance Metrics
- Component load time < 200ms
- Data fetching response time < 500ms
- No memory leaks in component lifecycle
- Proper error handling and loading states

---

## 🔒 Security & Privacy

### Data Handling
- All financial data encrypted in transit
- No sensitive data logged in browser console
- Proper input validation and sanitization
- Follow existing security patterns

### Privacy Compliance
- User financial data remains confidential
- No third-party data sharing
- Clear data usage transparency
- User can delete/modify all data

---

## 📱 Device & Browser Support

### Supported Devices
- Desktop: Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile: iOS Safari, Android Chrome
- Tablet: iPad Safari, Android tablets

### Responsive Design
- Mobile-first approach
- Breakpoints: 320px, 768px, 1024px, 1440px
- Touch-friendly interactions on mobile
- Accessible design following WCAG 2.1 guidelines

---

## 🧪 Testing Requirements

### Unit Testing
- Jest + React Testing Library
- Test all component functions
- Mock MCP tool responses
- Test error states

### Integration Testing
- Test component-to-MCP tool communication
- Test SWR data flow
- Test multi-language support

### User Acceptance Testing
- Test all AI advisor scenarios
- Verify component rendering in chat
- Test user interaction flows
- Performance testing on various devices

---

## 📋 Definition of Done

For each component to be considered complete:

✅ **Technical Requirements**
- Component renders in chat interface
- Integrates with MCP tools
- Uses SWR for data fetching
- Follows TypeScript interfaces
- Has proper error handling

✅ **UI/UX Requirements**
- Follows Infina design guidelines
- Mobile responsive
- Supports Vietnamese & English
- Accessible design
- Loading states implemented

✅ **Quality Requirements**
- Unit tests written and passing
- Code reviewed and approved
- Performance benchmarks met
- Security review completed
- Documentation updated

✅ **Integration Requirements**
- AI system prompt works end-to-end
- All scenarios can be executed
- Data flows correctly
- No breaking changes to existing features

---

**Document Prepared By:** AI Development Team  
**Review Required By:** Product Team, Design Team, Engineering Team  
**Estimated Implementation Time:** 4 weeks (1 developer)  
**Dependencies:** Existing MCP tools, SWR setup, Translation system 