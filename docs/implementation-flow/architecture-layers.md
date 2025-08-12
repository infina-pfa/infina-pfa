# Architecture Layers & Responsibilities

## Overview
Clean separation of concerns across 4 layers: Routes → Service → SWR → UI

## Layer Responsibilities

### 1. API Routes (`/app/api/`)
**Role**: Authentication & request forwarding  
**Responsibilities**:
- Authenticate user via `withAuth` wrapper
- Forward requests to backend
- Pass through responses/errors unchanged
- NO business logic
- NO validation (backend handles it)

```typescript
// ✅ GOOD - Simple forwarding
export const POST = withAuth(async (req, context) => {
  const body = await req.json();
  const response = await apiClient.post("/budgets", body);
  return NextResponse.json(response.data);
});

// ❌ BAD - Business logic in route
export const POST = withAuth(async (req, context) => {
  const body = await req.json();
  if (body.amount > 1000000) { // Don't do this!
    return NextResponse.json({ error: "Too much" });
  }
  // ...
});
```

### 2. Service Layer (`/lib/services/`)
**Role**: API abstraction & data transformation  
**Responsibilities**:
- Call API routes via `apiClient`
- Extract data from response wrapper
- Type safety with TypeScript
- NO state management
- NO UI logic

```typescript
// budget.service.ts
export const budgetService = {
  async getBudgets(month: number, year: number): Promise<BudgetResponse[]> {
    const response = await apiClient.get<BudgetResponse[]>("/budgets", { month, year });
    return response.data || [];  // Extract data, provide default
  },
  
  async createBudget(data: CreateBudgetRequest): Promise<BudgetResponse> {
    const response = await apiClient.post<BudgetResponse>("/budgets", data);
    return response.data;
  }
};
```

### 3. SWR Hooks (`/hooks/swr/`)
**Role**: Data fetching & caching  
**Responsibilities**:
- Manage cache with SWR
- Handle loading/error states
- Optimistic updates
- Cache invalidation
- NO UI components
- NO business logic

```typescript
// use-budget-operations.ts
export function useBudgets(month: number, year: number) {
  const { data, error, isLoading, mutate } = useSWR(
    ["budgets", month, year],
    () => budgetService.getBudgets(month, year)
  );

  return {
    budgets: data,
    isLoading,
    isError: error,
    refetch: mutate
  };
}

export function useCreateBudget(month: number, year: number) {
  const { trigger, isMutating, error } = useSWRMutation(
    ["budgets", "create"],
    async (_, { arg }) => {
      const newBudget = await budgetService.createBudget(arg);
      // Invalidate cache after creation
      await mutate(["budgets", month, year]);
      return newBudget;
    }
  );

  return { createBudget: trigger, isCreating: isMutating, error };
}
```

### 4. UI Components (`/components/`)
**Role**: User interaction & presentation  
**Responsibilities**:
- Render UI
- Handle user input
- Show loading/error states
- Display toasts
- Translate error messages
- Form validation (client-side)

```typescript
// budgeting-widget.tsx
export function BudgetingWidget() {
  const { budgets, isLoading, isError } = useBudgets(month, year);
  const { createBudget } = useCreateBudget(month, year);
  const { t } = useAppTranslation();
  const toast = useToast();

  const handleCreate = async (data: CreateBudgetRequest) => {
    try {
      await createBudget(data);
      toast.success(t("budgetCreated"));
    } catch (err) {
      const error = err as { code?: string };
      toast.error(t(error.code || "UNKNOWN_ERROR", { ns: "errors" }));
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage />;
  
  return <BudgetList budgets={budgets} onCreate={handleCreate} />;
}
```

## Data Flow Example

```
User clicks "Create Budget"
    ↓
[UI Component]
- Validates form
- Calls useCreateBudget hook
    ↓
[SWR Hook]  
- Calls budgetService.createBudget()
- Updates cache optimistically
    ↓
[Service Layer]
- Calls apiClient.post("/budgets", data)
- Returns typed response
    ↓
[API Route]
- Authenticates user
- Forwards to backend
- Returns response
    ↓
[Backend]
- Validates data
- Creates budget
- Returns result
```

## Quick Reference

| Layer | Location | Imports From | Responsibilities |
|-------|----------|--------------|------------------|
| **Routes** | `/app/api/` | `withAuth`, `apiClient` | Auth, forwarding |
| **Service** | `/lib/services/` | `apiClient` | API calls, types |
| **SWR** | `/hooks/swr/` | Services | Cache, states |
| **UI** | `/components/` | SWR hooks | Display, UX |

## Key Principles

### ✅ DO
- Keep each layer focused on its responsibility
- Use TypeScript for type safety across layers
- Handle errors at the UI layer
- Let validation happen at backend
- Use SWR for all data fetching

### ❌ DON'T
- Put business logic in routes
- Call API directly from components
- Mix UI logic with data fetching
- Duplicate validation across layers
- Use `fetch()` or `axios` directly in components

## Testing Strategy

1. **Routes**: Test auth & forwarding
2. **Service**: Test data transformation
3. **SWR Hooks**: Test caching & updates
4. **UI**: Test user interactions & display