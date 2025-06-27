import { User } from "@supabase/supabase-js";

export interface AuthUser extends User {
  id: string;
  email?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser | null;
  error: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
} 