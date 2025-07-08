import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface BudgetAnalysisRequest {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  spendingPercentage: number;
  userName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { totalBudget, totalSpent, remaining, spendingPercentage, userName }: BudgetAnalysisRequest = await request.json();

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
              // Server Component context
            }
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const currentDate = new Date();
    const currentDay = currentDate.getDate();

    // Create a contextual system prompt for budget analysis
    const systemPrompt = `You are Fina, a friendly Vietnamese financial advisor AI. 

Your task is to analyze the user's budget data and provide a personalized welcome message in Vietnamese. 

USER DATA:
- Name: ${userName || "bạn"}
- Total Monthly Budget: ${totalBudget.toLocaleString("vi-VN")} VND
- Amount Spent: ${totalSpent.toLocaleString("vi-VN")} VND  
- Remaining: ${remaining.toLocaleString("vi-VN")} VND
- Spending Percentage: ${spendingPercentage.toFixed(1)}%
- Current Date: Day ${currentDay} of the month

CONTEXT:
- Early month (days 1-10): Usually low spending
- Mid month (days 11-24): Normal spending pattern
- Late month (days 25-31): Usually higher spending, budget concerns

RESPONSE GUIDELINES:
1. Always respond in Vietnamese
2. Use a friendly, conversational tone like talking to a close friend
3. Keep it concise (2-3 sentences max)
4. Include specific observations about their spending pattern
5. Give encouraging advice if they're doing well, or gentle warnings if overspending
6. Use Vietnamese expressions and casual language
7. Include relevant emojis (💰📊💸)

EXAMPLES of good responses:
- If spending is high early in month: "Chào Khang! 😅 Hình như bạn đang chi tiêu hơi quá mức, giờ mới đầu tháng mà gần hết tiền rồi. Thử tiết kiệm một chút nhé! 💸"
- If spending is reasonable: "Chào Khang! 👋 Tài chính tháng này nhìn ổn đấy, bạn đã chi ${totalSpent.toLocaleString("vi-VN")}đ và còn lại ${remaining.toLocaleString("vi-VN")}đ. Tiếp tục duy trì nhé! 💰"
- If doing very well: "Chào Khang! 🎉 Tuyệt vời! Bạn mới chỉ chi ${spendingPercentage.toFixed(1)}% ngân sách, tiếp tục như vậy nhé!"

Generate a welcoming message based on their current spending situation.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: `Hãy phân tích tình hình tài chính của tôi và chào hỏi tôi.` 
        },
      ],
      temperature: 0.8,
      max_tokens: 150,
    });

    const analysisMessage = response.choices[0]?.message?.content || "Chào bạn! Hôm nay chúng ta cùng quản lý tài chính nhé! 💰";

    return NextResponse.json({
      success: true,
      data: {
        message: analysisMessage,
        budgetData: {
          totalBudget,
          totalSpent,
          remaining,
          spendingPercentage,
        },
      },
    });

  } catch (error) {
    console.error("Error in budget analysis:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to analyze budget data",
    }, { status: 500 });
  }
} 