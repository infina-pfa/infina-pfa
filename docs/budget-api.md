# Budget CRUD API Documentation

## Overview

The Budget API provides complete CRUD (Create, Read, Update, Delete) operations for managing user budgets in the Infina PFA application. All endpoints require user authentication and operate on budgets that belong to the authenticated user.

## Authentication

All API endpoints require authentication via Supabase Auth. The user session is validated using cookies managed by the Supabase client.

## Base URL

```
/api/budgets
```

## Data Models

### Budget

```typescript
interface Budget {
  id: string;
  name: string;
  amount: number;
  category: "fixed" | "flexible" | "planed";
  color: string;
  icon: string;
  started_at: string;
  ended_at: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}
```

### Budget Categories

- `fixed`: Fixed expenses (rent, insurance, etc.)
- `flexible`: Variable expenses (groceries, entertainment, etc.)
- `planed`: Planned expenses (vacation, large purchases, etc.)

## API Endpoints

### 1. Get All Budgets

**GET** `/api/budgets`

Retrieves all budgets for the authenticated user with optional filtering and pagination.

#### Query Parameters

| Parameter  | Type   | Description                                               |
| ---------- | ------ | --------------------------------------------------------- |
| `category` | string | Filter by budget category (`fixed`, `flexible`, `planed`) |
| `limit`    | number | Maximum number of budgets to return                       |
| `offset`   | number | Number of budgets to skip (for pagination)                |

#### Example Request

```bash
GET /api/budgets?category=flexible&limit=10&offset=0
```

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Groceries",
      "amount": 500.0,
      "category": "flexible",
      "color": "#2ECC71",
      "icon": "shopping-cart",
      "started_at": "2024-01-01T00:00:00.000Z",
      "ended_at": "2024-12-31T23:59:59.000Z",
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z",
      "user_id": "user-123"
    }
  ],
  "message": "Retrieved 1 budgets"
}
```

### 2. Get Single Budget

**GET** `/api/budgets/{id}`

Retrieves a specific budget by ID for the authenticated user.

#### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | Budget ID   |

#### Example Request

```bash
GET /api/budgets/550e8400-e29b-41d4-a716-446655440000
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Groceries",
    "amount": 500.0,
    "category": "flexible",
    "color": "#2ECC71",
    "icon": "shopping-cart",
    "started_at": "2024-01-01T00:00:00.000Z",
    "ended_at": "2024-12-31T23:59:59.000Z",
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z",
    "user_id": "user-123"
  },
  "message": "Budget retrieved successfully"
}
```

### 3. Create Budget

**POST** `/api/budgets`

Creates a new budget for the authenticated user.

#### Request Body

```typescript
interface CreateBudgetRequest {
  name: string; // Required: Budget name
  amount: number; // Required: Budget amount (must be positive)
  category?: string; // Optional: Budget category (defaults to "flexible")
  color: string; // Required: Color (hex format)
  icon: string; // Required: Icon identifier
  started_at?: string; // Optional: Start date (defaults to current date)
  ended_at: string; // Required: End date (must be after start date)
}
```

#### Example Request

```bash
POST /api/budgets
Content-Type: application/json

{
  "name": "Monthly Groceries",
  "amount": 600.00,
  "category": "flexible",
  "color": "#2ECC71",
  "icon": "shopping-cart",
  "started_at": "2024-01-01T00:00:00.000Z",
  "ended_at": "2024-12-31T23:59:59.000Z"
}
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Monthly Groceries",
    "amount": 600.0,
    "category": "flexible",
    "color": "#2ECC71",
    "icon": "shopping-cart",
    "started_at": "2024-01-01T00:00:00.000Z",
    "ended_at": "2024-12-31T23:59:59.000Z",
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z",
    "user_id": "user-123"
  },
  "message": "Budget created successfully"
}
```

### 4. Update Budget

**PUT** `/api/budgets/{id}`

Updates an existing budget for the authenticated user. All fields are optional in the update request.

#### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | Budget ID   |

#### Request Body

```typescript
interface UpdateBudgetRequest {
  name?: string; // Optional: Budget name
  amount?: number; // Optional: Budget amount (must be positive)
  category?: string; // Optional: Budget category
  color?: string; // Optional: Color (hex format)
  icon?: string; // Optional: Icon identifier
  started_at?: string; // Optional: Start date
  ended_at?: string; // Optional: End date (must be after start date)
}
```

#### Example Request

```bash
PUT /api/budgets/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "name": "Weekly Groceries",
  "amount": 150.00
}
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Weekly Groceries",
    "amount": 150.0,
    "category": "flexible",
    "color": "#2ECC71",
    "icon": "shopping-cart",
    "started_at": "2024-01-01T00:00:00.000Z",
    "ended_at": "2024-12-31T23:59:59.000Z",
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T15:30:00.000Z",
    "user_id": "user-123"
  },
  "message": "Budget updated successfully"
}
```

### 5. Delete Budget

**DELETE** `/api/budgets/{id}`

Deletes a budget for the authenticated user.

#### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | Budget ID   |

#### Example Request

```bash
DELETE /api/budgets/550e8400-e29b-41d4-a716-446655440000
```

#### Example Response

```json
{
  "success": true,
  "message": "Budget deleted successfully"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes

| Code  | Description                             |
| ----- | --------------------------------------- |
| `200` | OK - Request successful                 |
| `201` | Created - Resource created successfully |
| `400` | Bad Request - Invalid request data      |
| `401` | Unauthorized - Authentication required  |
| `404` | Not Found - Resource not found          |
| `500` | Internal Server Error - Server error    |

### Common Error Messages

- `"Unauthorized"` - User not authenticated
- `"Budget not found"` - Budget doesn't exist or doesn't belong to user
- `"Name is required and must be a non-empty string"` - Invalid name field
- `"Amount is required and must be a positive number"` - Invalid amount field
- `"Invalid budget category. Must be 'fixed', 'flexible', or 'planed'"` - Invalid category
- `"ended_at must be after started_at"` - Invalid date range

## Frontend Integration

### Using the Custom Hook

```typescript
import { useBudgets } from "@/hooks/use-budgets";

function BudgetsList() {
  const { budgets, loading, error, createBudget, updateBudget, deleteBudget } =
    useBudgets();

  const handleCreateBudget = async () => {
    const newBudget = await createBudget({
      name: "New Budget",
      amount: 1000,
      color: "#0055FF",
      icon: "wallet",
      ended_at: "2024-12-31T23:59:59.000Z",
    });

    if (newBudget) {
      console.log("Budget created:", newBudget);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {budgets.map((budget) => (
        <div key={budget.id}>
          <h3>{budget.name}</h3>
          <p>Amount: ${budget.amount}</p>
          <p>Category: {budget.category}</p>
        </div>
      ))}
      <button onClick={handleCreateBudget}>Create Budget</button>
    </div>
  );
}
```

### Direct API Calls

```typescript
// Create a budget
const createBudget = async (budgetData: CreateBudgetRequest) => {
  const response = await fetch("/api/budgets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(budgetData),
  });

  const result = await response.json();
  return result;
};

// Update a budget
const updateBudget = async (id: string, updates: UpdateBudgetRequest) => {
  const response = await fetch(`/api/budgets/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  const result = await response.json();
  return result;
};
```

## Security Notes

- All endpoints require user authentication
- Users can only access their own budgets
- Budget IDs are validated to prevent unauthorized access
- Input validation is performed on all fields
- SQL injection protection through Supabase ORM

## Performance Considerations

- Use pagination for large datasets (`limit` and `offset` parameters)
- Consider caching budget data on the frontend
- The API returns all budget fields by default; consider adding field selection if needed
- Database queries are optimized with proper indexing on `user_id` and `id` fields
