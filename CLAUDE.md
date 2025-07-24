# INFINA PFA - AI AGENT COMPREHENSIVE RULES & CODEBASE GUIDE

> **Version**: 2025 Edition  
> **Target**: AI Agents (Claude)  
> **Purpose**: Complete development guidance for Infina Personal Financial Advisor

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Development Environment](#development-environment)
3. [Architecture & Design Patterns](#architecture--design-patterns)
4. [Mandatory Coding Standards](#mandatory-coding-standards)
5. [UI/UX Design System](#uiux-design-system)
6. [AI System Specifications](#ai-system-specifications)
7. [Data Management & SWR](#data-management--swr)
8. [Internationalization (i18n)](#internationalization-i18n)
9. [Error Handling & Validation](#error-handling--validation)
10. [Security & Performance](#security--performance)
11. [Testing & Development Tools](#testing--development-tools)
12. [Special AI Agent Rules](#special-ai-agent-rules)

---

## 📊 PROJECT OVERVIEW

### Core Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode enabled
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with email verification
- **Styling**: Tailwind CSS with custom Infina design system
- **State Management**: SWR for data fetching and caching
- **AI Integration**: OpenAI GPT-4 with streaming responses and MCP
- **Internationalization**: i18next (Vietnamese + English)
- **Form Validation**: Zod schemas
- **UI Components**: Custom design system based on shadcn/ui

### Project Purpose
Sophisticated AI-powered personal financial advisor application that helps Vietnamese users manage their finances through different life stages: debt management, saving, and investing.

---

## 🛠️ DEVELOPMENT ENVIRONMENT

### Essential Commands
```bash
# Development
npm run dev              # Start development server (localhost:3000)
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # ESLint code quality check

# AI & Testing Tools
npm run logs            # Manage AI system prompt logs
npx tsx scripts/manage-system-prompt-logs.ts
npx tsx scripts/test-onboarding-flow.ts
./scripts/test-onboarding.sh
```

### Required Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

---

## 🏗️ ARCHITECTURE & DESIGN PATTERNS

### Core Architecture Principles

#### 1. SOLID Principles (MANDATORY)
- **Single Responsibility**: One purpose per component/function/hook
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Components replaceable with subtypes
- **Interface Segregation**: Focused, specific interfaces
- **Dependency Inversion**: Depend on abstractions, not implementations

#### 2. Layered Architecture (MANDATORY)
```
┌─────────────────────────────────┐
│ UI Components (React)           │
├─────────────────────────────────┤
│ Custom Hooks (SWR + Logic)      │
├─────────────────────────────────┤
│ Service Layer (API Clients)     │
├─────────────────────────────────┤
│ API Routes (Next.js)            │
├─────────────────────────────────┤
│ Database (Supabase)             │
└─────────────────────────────────┘
```

### Directory Structure Standards

#### `/app` - Next.js App Router
- **API Routes**: All backend endpoints in `/app/api/`
- **Pages**: Route-based components with layouts
- **Organization**: Feature-based grouping

#### `/components` - React Components
```
/components
├── ui/              # Design system components
├── auth/            # Authentication components  
├── budgeting/       # Budget management
├── chat/            # AI chat interface
├── goals/           # Financial goals
├── income/          # Income tracking
├── landing/         # Marketing pages
└── onboarding/      # User onboarding
```

#### `/lib` - Core Libraries
```
/lib
├── ai-advisor/      # Complete AI system
├── services/        # API service layer
├── types/           # TypeScript definitions
├── translations/    # i18n files
├── validation/      # Zod schemas
└── utils/           # Utility functions
```

#### `/hooks` - Custom React Hooks
```
/hooks
├── swr/            # SWR data fetching hooks
└── [feature].ts    # Feature-specific hooks
```

---

## 🎯 MANDATORY CODING STANDARDS

### Component Architecture Rules

#### 1. Component Size Limits (STRICTLY ENFORCED)
- **Maximum 200 lines** per component file
- **One component per file** (no exceptions)
- **Separate logic from UI** when >100 lines
- **Extract custom hooks** for complex state logic

```typescript
// ✅ GOOD - Component composition
const DashboardPage = () => (
  <div>
    <DashboardHeader />
    <DashboardStats />
    <DashboardContent />
  </div>
);

// ❌ BAD - Monolithic component
const DashboardPage = () => {
  // 200+ lines of mixed logic and UI - FORBIDDEN!
};
```

#### 2. Single Responsibility Hooks (MANDATORY)
- **One hook = One responsibility**
- **No monolithic hooks** (like old 271-line useBudgets)
- **Compose hooks when needed**

```typescript
// ✅ GOOD - Single responsibility
const useBudgetList = () => { /* Only manages list */ };
const useBudgetCreate = () => { /* Only handles creation */ };
const useBudgetUpdate = () => { /* Only handles updates */ };
const useBudgetDelete = () => { /* Only handles deletion */ };

// Composition when multiple operations needed
const useBudgetManagement = () => {
  const list = useBudgetList();
  const create = useBudgetCreate();
  const update = useBudgetUpdate();
  const remove = useBudgetDelete();
  return { list, create, update, remove };
};

// ❌ BAD - Monolithic hook
const useBudgets = () => {
  // 271 lines handling everything - FORBIDDEN!
};
```

### API Service Layer (MANDATORY)

#### No Direct API Calls Rule
```typescript
// ✅ GOOD - Service layer pattern
const budgetService = {
  async getAll(): Promise<Budget[]> {
    return apiClient.get<Budget[]>('/budgets');
  },
  async create(data: CreateBudgetRequest): Promise<Budget> {
    return apiClient.post<Budget>('/budgets', data);
  }
};

// ❌ BAD - Direct API calls in hooks/components
const useBudgets = () => {
  const response = await fetch('/api/budgets'); // FORBIDDEN!
};
```

### File Naming Conventions
- **Components**: `user-profile.tsx`, `payment-form.tsx`
- **Hooks**: `use-budget-list.ts`, `use-budget-create.ts`
- **Services**: `budget.service.ts`, `auth.service.ts`
- **Types**: `budget.types.ts`, `auth.types.ts`
- **Utils**: `format-currency.ts`, `validate-email.ts`

---

## 🎨 UI/UX DESIGN SYSTEM

### Infina Brand Guidelines (MANDATORY)

#### Core Design Principles
- **Flat & Modern**: Minimalist approach, no shadows/borders
- **Borderless Layouts**: Use whitespace and color blocks for separation
- **Typography Hierarchy**: Content separation without borders
- **Professional yet Friendly**: Approachable tone

#### Color Palette (STRICTLY ENFORCED)
```css
/* Primary Color */
--infina-blue: #0055FF;     /* Main actions, links, active states */

/* Supporting Colors */
--success-green: #2ECC71;   /* Success states, positive feedback */
--warning-yellow: #FFC107;  /* Warning states, caution messages */
--highlight-orange: #FF9800; /* Highlights, attention-grabbing */
--error-coral: #F44336;     /* Error states, destructive actions */

/* Background Colors */
--app-background: #F6F7F9;  /* Main app background */
--section-background: #F0F2F5; /* Section blocks */
--card-background: #FFFFFF; /* Card backgrounds */
--divider-color: #E0E0E0;   /* Subtle dividers (use sparingly) */
```

#### Typography Rules
- **Font Family**: Nunito (MANDATORY - no exceptions)
- **Capitalization**: First letter only (unless highlighting keywords)
- **No Text Effects**: No shadows, outlines, or bevels

#### Component Standards
```typescript
// ✅ GOOD - Flat design with brand colors
<Button className="bg-[#0055FF] hover:bg-[#0044DD] text-white font-nunito">
  {t('createBudget')}
</Button>

// ❌ BAD - Shadows, borders, wrong colors
<Button className="shadow-lg border-2 border-gray-300 bg-gradient-to-r">
  Create Budget
</Button>
```

#### What is FORBIDDEN
- ❌ Drop shadows, box shadows, text shadows
- ❌ Borders for visual separation
- ❌ Gradients or complex visual effects
- ❌ Colors outside the approved palette
- ❌ Fonts other than Nunito
- ❌ Complex animations or transitions

### Icon Standards
- **Library**: Lucide or Feather icons only
- **Colors**: Match brand palette
- **Style**: Line icons, consistent stroke width

---

## 🤖 AI SYSTEM SPECIFICATIONS

### AI Architecture Components

#### 1. Memory Management System
- **AsyncMemoryManager**: Handles user context and conversation memory
- **Background Persistence**: Non-blocking memory storage
- **Intelligent Extraction**: Extracts financial information from conversations
- **Memory Categories**: Organized by financial context

#### 2. Financial Stages System
```typescript
enum FinancialStage {
  DEBT = 'debt',           // Debt management & basic budgeting
  START_SAVING = 'saving', // Emergency fund & expense tracking  
  START_INVESTING = 'investing' // Investment planning & portfolio
}
```

#### 3. AI Chat System Features
- **Streaming Responses**: Real-time using OpenAI streaming API
- **MCP Integration**: Model Context Protocol for tool calling
- **Stage-Based Prompts**: Different AI behavior per financial stage
- **Component Integration**: AI triggers React components in chat

### OpenAI API Implementation Rules
- **MANDATORY**: Use Responses endpoint only
- **FORBIDDEN**: Chat Completion endpoint
- **Streaming**: Implement proper streaming for real-time responses

### AI Tool Definitions
Location: `/lib/ai-advisor/tools/definitions.ts`
- Define available tools for AI
- Register components in chat interface
- Maintain tool-to-component mapping

---

## 🔄 DATA MANAGEMENT & SWR

### SWR Principles (MANDATORY)

#### Core SWR Rules
- **Use SWR for ALL data fetching** - Replace fetch/axios calls
- **Service layer pattern** - SWR fetchers use service methods only
- **Consistent naming** - `useSomethingSWR` pattern
- **Centralized configuration** in SWRProvider

#### Data Management Standards
```typescript
// ✅ GOOD - Structured cache keys
const useBudgetList = () => {
  return useSWR(['budgets', 'list'], budgetService.getAll, {
    refreshInterval: 30000,
    revalidateOnFocus: true
  });
};

// ✅ GOOD - Standardized return object
const useBudgetCreate = () => {
  // Always return: { data, error, loading, refetch }
  return { data, error, loading: isLoading, refetch: mutate };
};

// ❌ BAD - Direct API calls
const useBudgets = () => {
  const response = await fetch('/api/budgets'); // FORBIDDEN!
};
```

#### Performance & UX Requirements
- **Optimistic updates** for immediate feedback
- **Conditional fetching** for dependent data
- **Proper cache invalidation** after mutations
- **Default values** - never return undefined/null

---

## 🌍 INTERNATIONALIZATION (i18n)

### Translation Requirements (MANDATORY)

#### Core i18n Rules
- **NEVER hardcode text** - All UI text must use translations
- **Support Vietnamese + English** - Current languages
- **Use react-i18next** for translation management
- **Organize by feature** for maintainability

#### Translation Implementation
```typescript
// ✅ GOOD - Using translations
import { useAppTranslation } from "@/hooks/use-translation";

const WelcomeMessage = () => {
  const { t } = useAppTranslation(["auth", "common"]);
  
  return (
    <div>
      <h1>{t("welcome")}</h1>
      <p>{t("getStartedMessage", { ns: "auth" })}</p>
      <button>{t("getStarted")}</button>
    </div>
  );
};

// ❌ BAD - Hardcoded text
const WelcomeMessage = () => {
  return (
    <div>
      <h1>Welcome</h1>  {/* FORBIDDEN! */}
      <p>Get started with your financial journey</p>
    </div>
  );
};
```

#### Translation File Organization
```typescript
// File: /lib/translations/en/auth.ts
export const authEn = {
  // Sign In Section
  signInTitle: "Sign in to your account",
  signInButton: "Sign In", 
  signInSuccess: "Successfully signed in",
  
  // Sign Up Section
  signUpTitle: "Create your account",
  signUpButton: "Sign Up",
  signUpSuccess: "Account created successfully",
  
  // Validation Messages
  emailRequired: "Email is required",
  passwordRequired: "Password is required",
};
```

#### Dynamic Content & Interpolation
```typescript
// ✅ GOOD - Dynamic translations
const BudgetSummary = ({ amount, budgetName }: Props) => {
  const { t } = useAppTranslation();
  
  return (
    <div>
      <h2>{t("budgetSummaryTitle", { name: budgetName })}</h2>
      <p>{t("budgetRemainingAmount", { amount: formatCurrency(amount) })}</p>
      <p>{t("expenseCount", { count: expenses.length })}</p>
    </div>
  );
};

// Translation file:
export const budgetEn = {
  budgetSummaryTitle: "{{name}} Budget Summary",
  budgetRemainingAmount: "Remaining: {{amount}}",
  expenseCount_one: "{{count}} expense",
  expenseCount_other: "{{count}} expenses",
};
```

### Translation Best Practices
- **Descriptive keys**: `heroMainTitle`, `authSignInButton`
- **Context in keys**: Better understanding for translators
- **Pluralization**: Handle singular/plural forms
- **Error messages**: Always translate error messages
- **Accessibility**: Translate alt texts, aria-labels

---

## ⚠️ ERROR HANDLING & VALIDATION

### Centralized Error Handling (MANDATORY)

#### Error Handling Strategy
```typescript
// ✅ GOOD - Centralized error handling
import { handleError } from '@/lib/error-handler';

const createBudget = async (data: CreateBudgetRequest) => {
  try {
    setLoading(true);
    setError(null);
    return await budgetService.create(data);
  } catch (error) {
    const appError = handleError(error);
    setError(appError.message);
    return null;
  } finally {
    setLoading(false);
  }
};

// ❌ BAD - Inconsistent error handling
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : "An error occurred";
  setError(errorMessage); // Not user-friendly, not translated
}
```

#### Error Handling Requirements
- **Centralized error codes** and messages
- **User-friendly messages** only (no technical details)
- **i18n support** in error messages
- **Consistent transformation** across the app

### Validation Standards
- **Zod schemas** for all form validation
- **Server-side validation** for security
- **Client-side feedback** for UX
- **Type safety** with TypeScript

---

## 🔒 SECURITY & PERFORMANCE

### Security Practices
- **Row Level Security**: Supabase RLS for data protection
- **Input Validation**: Server-side validation for all inputs
- **Authentication Flow**: Secure Supabase Auth implementation
- **API Security**: Proper middleware and error handling

### Performance Optimization
- **SWR Caching**: Intelligent data caching and revalidation
- **Code Splitting**: Next.js automatic code splitting  
- **Memory Management**: Efficient AI memory with background persistence
- **Image Optimization**: Next.js image optimization

---

## 🧪 TESTING & DEVELOPMENT TOOLS

### Available Scripts
```bash
# AI System Testing
npx tsx scripts/manage-system-prompt-logs.ts  # AI response tracking
npx tsx scripts/test-onboarding-flow.ts       # Onboarding flow test
./scripts/test-onboarding.sh                  # Shell onboarding test

# Development Tools
npm run logs                                   # System prompt management
npm run lint                                   # Code quality check
```

### Database Schema (Supabase)
- **Users**: Profiles and authentication
- **Budgets**: Categories and limits
- **Goals**: Financial goals and progress
- **Transactions**: Income and expense records  
- **Memory**: AI conversation memory
- **Conversations**: Chat history and context

---

## 🤖 SPECIAL AI AGENT RULES

### Rule 1: OpenAI API Implementation
- **MANDATORY**: Use Responses endpoint only
- **FORBIDDEN**: Chat Completion endpoint
- **Research**: Search latest OpenAI docs when needed

### Rule 2: Information Gaps
- **First**: Use Web Search tool for missing knowledge
- **Then**: Ask for clarification if search fails
- **Never**: Implement without proper understanding

### Rule 3: Version Control
- **NEVER**: Auto-execute git commit, push, or pull
- **ALWAYS**: Present commands first
- **WAIT**: For explicit approval before execution

### Rule 4: Code Implementation Priority
1. **Follow SOLID principles**
2. **Use service layer pattern**
3. **Implement proper i18n**
4. **Follow UI design system**
5. **Use SWR for data fetching**
6. **Maintain component size limits**

### Rule 5: Adding New Features
1. Create TypeScript interfaces in `/lib/types/`
2. Add SWR hooks in `/hooks/swr/`
3. Create service functions in `/lib/services/`
4. Build UI components following design system
5. Add translations for Vietnamese and English
6. Create API endpoints in `/app/api/`

---

## 📚 QUICK REFERENCE

### Common File Locations
```
📁 Components:     /components/[feature]/
📁 Hooks:          /hooks/swr/use-[feature]-[action].ts
📁 Services:       /lib/services/[feature].service.ts
📁 Types:          /lib/types/[feature].types.ts
📁 Translations:   /lib/translations/[lang]/[feature].ts
📁 API Routes:     /app/api/[feature]/route.ts
📁 AI Prompts:     /lib/ai-advisor/prompts/
📁 AI Tools:       /lib/ai-advisor/tools/
```

### Essential Imports
```typescript
// Translation
import { useAppTranslation } from "@/hooks/use-translation";

// SWR Hooks
import { useBudgetListSWR } from "@/hooks/swr/use-budget-list";

// Services  
import { budgetService } from "@/lib/services/budget.service";

// Error Handling
import { handleError } from "@/lib/error-handler";

// UI Components
import { Button } from "@/components/ui/button";
```

---

**🎯 REMEMBER**: This is a production-ready financial advisor application. Every component, hook, and service must follow these rules strictly. No exceptions for code quality, design consistency, or internationalization requirements.

**📋 FOR AI AGENTS**: Always reference this guide before making any code changes. When in doubt, follow the established patterns and ask for clarification rather than improvising.