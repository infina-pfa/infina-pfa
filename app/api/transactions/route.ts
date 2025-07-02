import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/database";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: "Missing or invalid authorization header"
      }, { status: 401 });
    }

    // Extract the token
    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized"
      }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit');
    const budgetId = url.searchParams.get('budgetId');

    let data, error;

    // Filter by budget if provided
    if (budgetId) {
      let budgetQuery = supabase
        .from("transactions")
        .select(`
          *,
          budget_transactions!inner (
            budget_id
          )
        `)
        .eq("user_id", user.id)
        .eq('budget_transactions.budget_id', budgetId)
        .order("created_at", { ascending: false });

      // Apply limit if provided
      if (limit) {
        const parsedLimit = parseInt(limit);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
          budgetQuery = budgetQuery.limit(parsedLimit);
        }
      }

      const result = await budgetQuery;
      data = result.data;
      error = result.error;
    } else {
      let query = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Apply limit if provided
      if (limit) {
        const parsedLimit = parseInt(limit);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
          query = query.limit(parsedLimit);
        }
      }

      const result = await query;
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error("Error fetching transactions:", error);
      return NextResponse.json({
        success: false,
        error: "Failed to fetch transactions"
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error("Error in transactions GET:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: "Missing or invalid authorization header"
      }, { status: 401 });
    }

    // Extract the token
    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized"
      }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { name, amount, description, type, budgetId, date } = body;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json({
        success: false,
        error: "Transaction name is required"
      }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        error: "Amount must be greater than 0"
      }, { status: 400 });
    }

    if (!type || !['income', 'outcome', 'transfer'].includes(type)) {
      return NextResponse.json({
        success: false,
        error: "Valid transaction type is required (income, outcome, transfer)"
      }, { status: 400 });
    }

    // If budgetId is provided, verify budget exists and belongs to user
    if (budgetId) {
      const { data: budget, error: budgetError } = await supabase
        .from("budgets")
        .select("id")
        .eq("id", budgetId)
        .eq("user_id", user.id)
        .single();

      if (budgetError || !budget) {
        return NextResponse.json({
          success: false,
          error: "Budget not found"
        }, { status: 404 });
      }
    }

    // Create transaction
    const transactionData = {
      user_id: user.id,
      name: name.trim(),
      amount: parseFloat(amount),
      description: description?.trim() || null,
      type,
      recurring: 0,
      ...(date && { created_at: new Date(date).toISOString() })
    };

    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert(transactionData)
      .select("*")
      .single();

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      return NextResponse.json({
        success: false,
        error: "Failed to create transaction"
      }, { status: 500 });
    }

    let budgetTransaction = null;

    // If budgetId is provided, link transaction to budget
    if (budgetId) {
      const { data: bt, error: linkError } = await supabase
        .from("budget_transactions")
        .insert({
          user_id: user.id,
          budget_id: budgetId,
          transaction_id: transaction.id,
        })
        .select("*")
        .single();

      if (linkError) {
        // If linking fails, delete the transaction to maintain consistency
        await supabase
          .from("transactions")
          .delete()
          .eq("id", transaction.id);
        
        console.error("Error linking transaction to budget:", linkError);
        return NextResponse.json({
          success: false,
          error: "Failed to link transaction to budget"
        }, { status: 500 });
      }

      budgetTransaction = bt;
    }

    return NextResponse.json({
      success: true,
      data: {
        transaction,
        budgetTransaction
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error in transactions POST:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
} 