import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FINANCIAL_STAGES = {
  survival: {
    name: "Survival Stage",
    description: "Focus on stopping cash bleed and basic financial stability"
  },
  debt: {
    name: "Debt Elimination", 
    description: "Priority on eliminating high-interest debt"
  },
  foundation: {
    name: "Foundation Building",
    description: "Building emergency fund and financial foundation"
  },
  investing: {
    name: "Investing Stage",
    description: "Ready to start building wealth through investments"
  },
  optimizing: {
    name: "Optimizing Assets",
    description: "Optimizing investment portfolio and tax efficiency"
  },
  protecting: {
    name: "Protecting Assets", 
    description: "Focus on insurance and asset protection"
  },
  retirement: {
    name: "Retirement Planning",
    description: "Advanced retirement and estate planning"
  }
} as const;

export async function POST(request: NextRequest) {
  try {
    const { profile } = await request.json();

    if (!profile) {
      return NextResponse.json({
        success: false,
        error: "Profile data is required"
      }, { status: 400 });
    }

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
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }

    try {
      // Use AI to analyze financial stage
      const analysisPrompt = `
        Analyze this user's financial profile and determine their appropriate financial stage:

        User Profile:
        - Name: ${profile.name || 'Not provided'}
        - Age: ${profile.age || 'Not provided'}
        - Monthly Income: ${profile.income ? `${profile.income.toLocaleString()} VND` : 'Not provided'}
        - Monthly Expenses: ${profile.expenses ? `${profile.expenses.toLocaleString()} VND` : 'Not provided'} 
        - Current Debts: ${profile.currentDebts ? `${profile.currentDebts.toLocaleString()} VND` : 'Not provided'}
        - Current Savings: ${profile.savings ? `${profile.savings.toLocaleString()} VND` : 'Not provided'}
        - Investment Experience: ${profile.investmentExperience || 'Not provided'}
        - Primary Financial Goal: ${profile.primaryFinancialGoal || 'Not provided'}
        - Risk Tolerance: ${profile.riskTolerance || 'Not provided'}

        Available Financial Stages:
        ${Object.entries(FINANCIAL_STAGES).map(([key, stage]) => 
          `- ${key}: ${stage.name} - ${stage.description}`
        ).join('\n')}

        Based on this profile, determine:
        1. The most appropriate financial stage (survival, debt, foundation, investing, optimizing, protecting, retirement)
        2. Confidence level (0.0 to 1.0)
        3. Clear reasoning for this classification

        Respond in JSON format:
        {
          "stage": "stage_key",
          "confidence": 0.8,
          "reasoning": "Detailed explanation of why this stage was selected"
        }
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-2025-04-14",
        messages: [
          {
            role: "system",
            content: "You are a financial advisor AI that analyzes user profiles to determine their appropriate financial stage. Always respond with valid JSON only."
          },
          {
            role: "user", 
            content: analysisPrompt
          }
        ],
        temperature: 0.3
      });

      const analysisResult = JSON.parse(completion.choices[0].message.content || "{}");

      return NextResponse.json({
        success: true,
        data: analysisResult
      });

    } catch (aiError) {
      console.error("AI Analysis failed, using fallback logic:", aiError);
      
      // Fallback to rule-based analysis
      const fallbackResult = fallbackStageAnalysis(profile);
      
      return NextResponse.json({
        success: true,
        data: fallbackResult
      });
    }

  } catch (error) {
    console.error("Error in onboarding analyze-stage:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}

interface ProfileData {
  name?: string;
  age?: number;
  income?: number;
  expenses?: number;
  currentDebts?: number;
  savings?: number;
  investmentExperience?: "none" | "beginner" | "intermediate" | "advanced";
  primaryFinancialGoal?: string;
  riskTolerance?: string;
}

function fallbackStageAnalysis(profile: ProfileData) {
  const income = profile.income || 0;
  const expenses = profile.expenses || 0;
  const debts = profile.currentDebts || 0;
  const savings = profile.savings || 0;

  // Stage 0: Survival - negative cash flow
  if (income < expenses) {
    return {
      stage: "survival",
      confidence: 0.8,
      reasoning: "Negative cash flow indicates immediate need for financial stabilization and expense reduction"
    };
  }

  // Stage 1: Debt - has significant high-interest debt
  if (debts > income * 0.3) {
    return {
      stage: "debt",
      confidence: 0.7,
      reasoning: "High debt-to-income ratio (>30%) suggests prioritizing debt elimination before other financial goals"
    };
  }

  // Stage 2: Foundation - little to no emergency fund
  const monthlyExpenses = expenses;
  const emergencyFundMonths = monthlyExpenses > 0 ? savings / monthlyExpenses : 0;
  
  if (emergencyFundMonths < 3) {
    return {
      stage: "foundation",
      confidence: 0.7,
      reasoning: "Insufficient emergency fund (<3 months expenses) indicates need for foundation building before investing"
    };
  }

  // Stage 3: Investing - has good foundation, ready to invest
  if (emergencyFundMonths >= 3 && profile.investmentExperience === "none") {
    return {
      stage: "investing",
      confidence: 0.6,
      reasoning: "Good financial foundation established, ready to begin wealth building through investments"
    };
  }

  // Stage 4: Optimizing - experienced investor with substantial assets
  if (profile.investmentExperience === "intermediate" || profile.investmentExperience === "advanced") {
    return {
      stage: "optimizing",
      confidence: 0.6,
      reasoning: "Investment experience suggests focus on portfolio optimization and tax efficiency"
    };
  }

  // Default to foundation building
  return {
    stage: "foundation",
    confidence: 0.5,
    reasoning: "Based on available information, foundation building appears most appropriate"
  };
} 