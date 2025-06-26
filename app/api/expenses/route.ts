import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreateExpenseRequest } from '@/lib/types/expense.types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Build query
    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('expense_date', { ascending: false });

    // Apply filters
    const budgetId = searchParams.get('budget_id');
    if (budgetId) {
      query = query.eq('budget_id', budgetId);
    }

    const fromDate = searchParams.get('from_date');
    if (fromDate) {
      query = query.gte('expense_date', fromDate);
    }

    const toDate = searchParams.get('to_date');
    if (toDate) {
      query = query.lte('expense_date', toDate);
    }

    const recurringMonth = searchParams.get('recurring_month');
    if (recurringMonth) {
      query = query.eq('recurring_month', parseInt(recurringMonth));
    }

    const limit = searchParams.get('limit');
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const offset = searchParams.get('offset');
    if (offset) {
      const offsetNum = parseInt(offset);
      const limitNum = limit ? parseInt(limit) : 50;
      query = query.range(offsetNum, offsetNum + limitNum - 1);
    }

    const { data: expenses, error } = await query;

    if (error) {
      console.error('Error fetching expenses:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch expenses' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: expenses,
      total: expenses?.length || 0,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CreateExpenseRequest = await request.json();

    // Validate required fields
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (!body.expense_date) {
      return NextResponse.json(
        { success: false, error: 'Expense date is required' },
        { status: 400 }
      );
    }

    // Validate expense date is not in the future
    const expenseDate = new Date(body.expense_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (expenseDate > today) {
      return NextResponse.json(
        { success: false, error: 'Expense date cannot be in the future' },
        { status: 400 }
      );
    }

    // Create expense
    const { data: expense, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        amount: body.amount,
        budget_id: body.budget_id,
        description: body.description,
        expense_date: body.expense_date,
        recurring_month: body.recurring_month,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating expense:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create expense' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: expense,
      message: 'Expense created successfully',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 