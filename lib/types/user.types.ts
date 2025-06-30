// Database types - using direct type definitions to avoid schema constraints
export interface User {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  user_id: string;
  total_asset_value: number;
}

export interface UserInsert {
  name: string;
  user_id: string;
  total_asset_value?: number;
}

export interface UserUpdate {
  name?: string;
  total_asset_value?: number;
  updated_at?: string;
}

// User creation request
export interface CreateUserRequest {
  name: string;
}

// User profile response
export interface UserProfile {
  id: string;
  name: string;
  user_id: string;
  total_asset_value: number;
  created_at: string;
  updated_at: string;
}

// User service response types
export interface UserResponse {
  user: UserProfile | null;
  error: string | null;
}

export interface UserCheckResponse {
  exists: boolean;
  user: UserProfile | null;
  error: string | null;
} 