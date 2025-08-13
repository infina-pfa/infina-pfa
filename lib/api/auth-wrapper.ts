import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";
import axios, { AxiosInstance, AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { INFINA_FINANCIAL_SERVICE_URL } from "../config";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AuthenticatedContext<T extends Record<string, unknown> = {}> {
  user: User;
  apiClient: AxiosInstance;
  stream: (url: string, options: RequestInit) => Promise<Response>;
  params?: T;
}

export type AuthenticatedHandler<T extends Record<string, unknown>> = (
  request: NextRequest,
  context: AuthenticatedContext<T>
) => Promise<NextResponse> | NextResponse;

/**
 * Wrapper for authenticated API routes
 * Automatically handles authentication and provides user context
 *
 * For dynamic routes: withAuth<{ id: string }>((req, ctx) => {...})
 * For static routes: withAuth((req, ctx) => {...})
 */
export function withAuth<
  T extends Record<string, unknown> = Record<string, never>
>(handler: AuthenticatedHandler<T>) {
  // Return a function that matches Next.js expectations
  return async function (
    request: NextRequest,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context?: any // Next.js 15 has varying signatures for route handlers
  ): Promise<NextResponse> {
    let params: T | undefined;

    // For dynamic routes, context is required and has params
    if (context?.params) {
      params = await context.params;
    }

    try {
      const supabase = await createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const stream = async (url: string, options: RequestInit) => {
        return await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${session?.access_token}`,
          },
        });
      };

      const context: AuthenticatedContext<T> = {
        user,
        stream,
        apiClient: axios.create({
          baseURL: INFINA_FINANCIAL_SERVICE_URL,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
        }),
        params,
      };

      // Execute the handler and catch any errors
      try {
        return await handler(request, context);
      } catch (handlerError) {
        // If the handler throws a NextResponse, return it as-is
        if (handlerError instanceof NextResponse) {
          return handlerError;
        }

        // Handle AxiosError from backend API calls
        if (handlerError instanceof AxiosError) {
          const axiosError = handlerError as AxiosError<{
            statusCode?: number;
            message?: string;
            error?: string;
            code?: string;
            timestamp?: string;
            path?: string;
          }>;

          // If we have a response from the backend, pass through its error details
          if (axiosError.response?.data) {
            const errorData = axiosError.response.data;
            const status = axiosError.response.status;

            return NextResponse.json(
              {
                error: errorData.message || "Request failed",
                code: errorData.code,
                statusCode: errorData.statusCode || status,
              },
              { status }
            );
          }

          // If no response (network error, timeout, etc.)
          if (axiosError.request) {
            return NextResponse.json(
              { error: "Unable to connect to server" },
              { status: 503 }
            );
          }

          // Other axios errors
          return NextResponse.json(
            { error: axiosError.message || "Request failed" },
            { status: 500 }
          );
        }

        // For any other unexpected errors
        console.error("Unexpected error in API route:", handlerError);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
      }
    } catch (error) {
      // This catches auth errors from the wrapper itself
      if (error instanceof NextResponse) {
        return error;
      }

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

export const ApiError = {
  unauthorized: (message = "Unauthorized") =>
    NextResponse.json({ error: message }, { status: 401 }),

  forbidden: (message = "Forbidden") =>
    NextResponse.json({ error: message }, { status: 403 }),

  notFound: (message = "Not found") =>
    NextResponse.json({ error: message }, { status: 404 }),

  badRequest: (message = "Bad request") =>
    NextResponse.json({ error: message }, { status: 400 }),

  internal: (message = "Internal server error") =>
    NextResponse.json({ error: message }, { status: 500 }),
};

export const ApiResponse = {
  success: <T>(data: T, status = 200) => NextResponse.json(data, { status }),

  created: <T>(data: T) => NextResponse.json(data, { status: 201 }),

  noContent: () => new NextResponse(null, { status: 204 }),
};
