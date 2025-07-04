import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Create Supabase client
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }

    // Check if transaction exists and belongs to user
    const { data: existingTransaction, error: checkError } = await supabase
      .from("transactions")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (checkError || !existingTransaction) {
      return NextResponse.json({
        success: false,
        error: "Transaction not found"
      }, { status: 404 });
    }

    // Delete budget_transactions first (if any)
    await supabase
      .from("budget_transactions")
      .delete()
      .eq("transaction_id", id);

    // Then delete the transaction
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting transaction:", error);
      return NextResponse.json({
        success: false,
        error: "Failed to delete transaction"
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { success: true }
    });

  } catch (error) {
    console.error("Error in transaction DELETE:", error);
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

    // Check if transaction exists and belongs to user
    const { data: existingTransaction, error: checkError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (checkError || !existingTransaction) {
      return NextResponse.json({
        success: false,
        error: "Transaction not found"
      }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { name, amount, description, date } = body;

    // Validate fields if provided
    if (name !== undefined && !name?.trim()) {
      return NextResponse.json({
        success: false,
        error: "Transaction name cannot be empty"
      }, { status: 400 });
    }

    if (amount !== undefined && (amount <= 0)) {
      return NextResponse.json({
        success: false,
        error: "Amount must be greater than 0"
      }, { status: 400 });
    }

    // Build update data
    const updateData: Record<string, string | number | null> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (date !== undefined) updateData.created_at = new Date(date).toISOString();

    // Update transaction
    const { data: transaction, error } = await supabase
      .from("transactions")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating transaction:", error);
      return NextResponse.json({
        success: false,
        error: "Failed to update transaction"
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error("Error in transaction PUT:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
} 