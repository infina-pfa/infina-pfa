import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Authenticates a user and returns the user object
 * @returns Object containing user data or error response
 */
export async function authenticateUser() {
  // Create Supabase client
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  return { user, errorResponse: null };
}
