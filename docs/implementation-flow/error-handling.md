# Error Handling Guide

## Overview
Errors flow from backend → API routes → frontend → translation layer. Each layer has a specific responsibility.

## Error Flow

```
Backend (NestJS) → API Route (withAuth) → API Client → SWR Hook → Component → Translation
```

## Key Components

### 1. Backend Response Format
```typescript
{
  statusCode: 409,
  message: "Budget already exists",
  code: "BUDGET_ALREADY_EXISTS",  // Translation key
  timestamp: "2025-08-11T15:31:33.227Z"
}
```

### 2. API Routes (`withAuth` wrapper)
- **Location**: `/lib/api/auth-wrapper.ts`
- **Role**: Catches AxiosError, extracts backend error details, forwards to frontend
- **No try-catch needed** in route handlers

```typescript
export const POST = withAuth(async (req, context) => {
  const response = await apiClient.post("/endpoint", body);
  return NextResponse.json(response.data);
  // Errors handled automatically by withAuth
});
```

### 3. API Client
- **Location**: `/lib/api-client.ts`
- **Role**: Pass through errors unchanged, attach code and statusCode

```typescript
if (!response.ok) {
  const error = new Error(result.error || "Request failed");
  error.code = result.code;      // Backend error code
  error.statusCode = response.status;
  throw error;
}
```

### 4. SWR Hooks
- **Pattern**: Use `useSWRMutation` for mutations
- **Let errors bubble up** to components

```typescript
const { trigger, error } = useSWRMutation(
  ["budgets", "create"],
  async (_, { arg }) => budgetService.createBudget(arg)
);
```

### 5. Component Error Handling
- **Use try-catch** for async operations
- **Translate error codes** directly

```typescript
try {
  await createBudget(data);
  toast.success(t("budgetCreated", { ns: "budgeting" }));
} catch (err) {
  const error = err as { code?: string; message?: string };
  toast.error(t(error.code || "UNKNOWN_ERROR", { 
    ns: "errors",
    defaultValue: error.message 
  }));
}
```

### 6. Translation Files
- **Location**: `/lib/translations/[lang]/errors.ts`
- **Error codes ARE translation keys**

```typescript
export const errorsEn = {
  BUDGET_ALREADY_EXISTS: "Budget already exists for this month",
  BUDGET_NOT_FOUND: "Budget not found",
  // ... other error codes
};
```

## Best Practices

### ✅ DO
- Use error codes from backend as translation keys
- Handle errors at component level
- Provide fallback messages using `defaultValue`
- Keep error handling close to user interaction

### ❌ DON'T
- Add global SWR error handlers (causes duplicates)
- Override backend error messages in API client
- Use generic error messages
- Add try-catch in API routes (withAuth handles it)

## Quick Reference

```typescript
// Component with error handling
const handleSubmit = async () => {
  try {
    const result = await mutate(data);
    toast.success(t("success", { ns: "common" }));
  } catch (err) {
    const error = err as { code?: string; message?: string };
    toast.error(t(error.code || "UNKNOWN_ERROR", { 
      ns: "errors",
      defaultValue: error.message 
    }));
  }
};
```

## Error Code Examples

| Backend Code | English | Vietnamese |
|-------------|---------|------------|
| `BUDGET_ALREADY_EXISTS` | Budget already exists for this month | Ngân sách đã tồn tại cho tháng này |
| `BUDGET_NOT_FOUND` | Budget not found | Không tìm thấy ngân sách |
| `UNAUTHORIZED` | You are not authorized | Bạn không có quyền |