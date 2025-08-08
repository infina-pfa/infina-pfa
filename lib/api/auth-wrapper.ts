import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { User } from '@supabase/supabase-js';

export interface AuthenticatedContext {
  user: User;
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never;
  accessToken?: string;
}

export type AuthenticatedHandler = (
  request: NextRequest,
  context: AuthenticatedContext
) => Promise<NextResponse> | NextResponse;

/**
 * Wrapper for authenticated API routes
 * Automatically handles authentication and provides user context
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest) => {
    try {
      const supabase = await createClient();
      
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      // Get session for access token if needed
      const { data: { session } } = await supabase.auth.getSession();
      
      // Create context with authenticated user and supabase client
      const context: AuthenticatedContext = {
        user,
        supabase,
        accessToken: session?.access_token,
      };
      
      // Call the actual handler with context
      return await handler(request, context);
      
    } catch (error) {
      console.error('API error:', error);
      
      // Check if error is already a NextResponse
      if (error instanceof NextResponse) {
        return error;
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper to create standard error responses
 */
export const ApiError = {
  unauthorized: (message = 'Unauthorized') => 
    NextResponse.json({ error: message }, { status: 401 }),
  
  forbidden: (message = 'Forbidden') => 
    NextResponse.json({ error: message }, { status: 403 }),
  
  notFound: (message = 'Not found') => 
    NextResponse.json({ error: message }, { status: 404 }),
  
  badRequest: (message = 'Bad request') => 
    NextResponse.json({ error: message }, { status: 400 }),
  
  internal: (message = 'Internal server error') => 
    NextResponse.json({ error: message }, { status: 500 }),
};

/**
 * Helper to create success responses
 */
export const ApiResponse = {
  success: <T>(data: T, status = 200) => 
    NextResponse.json(data, { status }),
  
  created: <T>(data: T) => 
    NextResponse.json(data, { status: 201 }),
  
  noContent: () => 
    new NextResponse(null, { status: 204 }),
};