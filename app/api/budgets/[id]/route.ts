import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }

    // Get budget by ID
    const { data: budget, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: "Budget not found"
        }, { status: 404 });
      }

      console.error("Error fetching budget:", error);
      return NextResponse.json({
        success: false,
        error: "Failed to fetch budget"
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: budget
    });

  } catch (error) {
    console.error("Error in budget GET:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }

    // Check if budget exists and belongs to user
    const { data: existingBudget, error: checkError } = await supabase
      .from("budgets")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (checkError || !existingBudget) {
      return NextResponse.json({
        success: false,
        error: "Budget not found"
      }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { name, month, year, color, icon, category } = body;

    // Validate name if provided
    if (name !== undefined && !name?.trim()) {
      return NextResponse.json({
        success: false,
        error: "Budget name cannot be empty"
      }, { status: 400 });
    }

    // Check for duplicate name if name is being updated
    if (name && name.trim() !== existingBudget.name) {
      const { data: duplicateBudget } = await supabase
        .from("budgets")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", name.trim())
        .eq("month", month || existingBudget.month)
        .eq("year", year || existingBudget.year)
        .neq("id", id)
        .single();

      if (duplicateBudget) {
        return NextResponse.json({
          success: false,
          error: "Budget with this name already exists for this month"
        }, { status: 409 });
      }
    }

    // Build update data
    const updateData: Record<string, string | number> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;
    if (category !== undefined) updateData.category = category;
    if (month !== undefined) updateData.month = month;
    if (year !== undefined) updateData.year = year;

    // Update budget
    const { data: budget, error } = await supabase
      .from("budgets")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating budget:", error);
      return NextResponse.json({
        success: false,
        error: "Failed to update budget"
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: budget
    });

  } catch (error) {
    console.error("Error in budget PUT:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }

    // Check if budget exists and belongs to user
    const { data: existingBudget, error: checkError } = await supabase
      .from("budgets")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (checkError || !existingBudget) {
      return NextResponse.json({
        success: false,
        error: "Budget not found"
      }, { status: 404 });
    }

    // Delete budget
    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting budget:", error);
      return NextResponse.json({
        success: false,
        error: "Failed to delete budget"
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Budget deleted successfully"
    });

  } catch (error) {
    console.error("Error in budget DELETE:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
} 