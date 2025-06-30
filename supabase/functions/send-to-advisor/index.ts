import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import OpenAI from "npm:openai";
import { corsHeaders } from "../_shared/cors.ts";

// Declare Deno global for Supabase Edge Functions
declare global {
  interface Window {
    Deno: {
      env: {
        get(key: string): string | undefined;
      };
    };
  }
}

// For Deno runtime, Deno is available globally
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const client = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

interface ChatTool {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

interface ConversationMessage {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
}

interface MCPTool {
  type: "mcp";
  server_label: string;
  server_url: string;
  require_approval: "never" | "always";
  allowed_tools?: string[];
  headers?: Record<string, string>;
}

interface FunctionTool {
  type: "function";
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
}

enum ResponseDataEvent {
  RESPONSE_CREATED = "response_created",
  OUTPUT_TEXT_STREAMING = "response_output_text_streaming",
  OUTPUT_TEXT_DONE = "response_output_text_done",
  FUNCTION_CALL_ARGUMENTS_STREAMING = "response_function_call_arguments_streaming",
  FUNCTION_CALL_ARGUMENTS_DONE = "response_function_call_arguments_done",
  MCP_TOOL_CALLING = "mcp_tool_calling",
  MCP_TOOL_CALL_DONE = "mcp_tool_call_done",
  MCP_TOOL_CALL_FAILED = "mcp_tool_call_failed",
  RESPONSE_COMPLETED = "response_completed",
}

enum UIActionType {
  OPEN_TOOL = "open_tool",
  SHOW_COMPONENT = "show_component",
}

// Enhanced MCP Configuration
interface MCPConfig {
  enabled: boolean;
  serverUrl: string;
  serverLabel: string;
  timeout: number;
  retryAttempts: number;
  requireApproval: "never" | "always";
  allowedTools?: string[];
  description: string;
  headers?: Record<string, string>;
  bearerToken?: string;
}

// Define proper error type for MCP
interface MCPError {
  message?: string;
  code?: string;
  name?: string;
  stack?: string;
}

const mcpConfig: MCPConfig = {
  enabled: true,
  serverUrl: Deno.env.get("MCP_SERVER_URL") || "",
  serverLabel: "personal-finance-management-tools",
  timeout: 30000, // 30 seconds
  retryAttempts: 2,
  requireApproval: "never",
  // Allow all tools from MCP server - no restrictions
  allowedTools: undefined,
  description: "Personal Finance Management Tools",
  bearerToken: Deno.env.get("MCP_BEARER_TOKEN"),
};

// MCP Tool Discovery and Validation
async function validateMCPServer(config: MCPConfig): Promise<boolean> {
  try {
    console.log(`🔍 Validating MCP Server: ${config.serverUrl}`);

    // Basic URL validation
    const url = new URL(config.serverUrl);
    if (!url.protocol.startsWith("http")) {
      console.warn("⚠️ MCP Server URL must use HTTP/HTTPS protocol");
      return false;
    }

    // TODO: Add actual server health check when needed
    // For now, assume valid if URL is well-formed
    console.log("✅ MCP Server URL validation passed");
    return true;
  } catch (error) {
    console.error("❌ MCP Server validation failed:", error);
    return false;
  }
}

// Enhanced MCP Error Handling with proper typing
function handleMCPError(
  error: MCPError | Error | unknown,
  context: string
): void {
  const errorDetails = {
    message: "Unknown MCP error",
    code: "UNKNOWN",
    serverUrl: mcpConfig.serverUrl,
    timestamp: new Date().toISOString(),
  };

  if (error instanceof Error) {
    errorDetails.message = error.message;
  } else if (error && typeof error === "object") {
    const mcpError = error as MCPError;
    errorDetails.message = mcpError.message || "Unknown MCP error";
    errorDetails.code = mcpError.code || "UNKNOWN";
  }

  console.error(`🔥 MCP Error in ${context}:`, errorDetails);
}

const chatTools: ChatTool[] = [
  {
    id: "budget-tool",
    name: "Công cụ Ngân sách",
    description: "Giúp người dùng tạo và quản lý ngân sách cá nhân",
    keywords: ["ngân sách", "budget", "chi tiêu", "tiết kiệm", "quản lý tiền"],
  },
  {
    id: "loan-calculator",
    name: "Công cụ tính lãi vay",
    description: "Tính toán lãi suất và lịch trả nợ cho các khoản vay",
    keywords: ["tính vay", "vay tiền", "lãi vay", "loan", "tín dụng", "trả nợ"],
  },
  {
    id: "interest-calculator",
    name: "Công cụ tính lãi tiết kiệm",
    description: "Tính toán lãi suất tiền gửi tiết kiệm",
    keywords: ["tính lãi", "lãi suất", "tiết kiệm", "interest", "tiền gửi"],
  },
  {
    id: "salary-calculator",
    name: "Công cụ tính lương",
    description: "Tính lương gross sang net và các khoản khấu trừ",
    keywords: [
      "tính lương",
      "lương net",
      "lương gross",
      "salary",
      "thuế thu nhập",
    ],
  },
  {
    id: "bank-interest-compare",
    name: "So sánh lãi suất ngân hàng",
    description: "So sánh lãi suất tiền gửi của các ngân hàng",
    keywords: [
      "so sánh lãi suất",
      "lãi suất ngân hàng",
      "bank interest",
      "ngân hàng",
    ],
  },
  {
    id: "learning-center",
    name: "Hành trình Học tập",
    description:
      "Hiển thị hành trình học tập thực tế của người dùng với milestone và task cụ thể dựa trên dữ liệu thật",
    keywords: [
      "học",
      "kiến thức",
      "tài chính",
      "learning",
      "bài học",
      "hành trình",
      "milestone",
      "task",
      "progress",
      "tiến độ",
    ],
  },
];

const chatComponents = [
  {
    id: "budget-overview",
    name: "Tổng quan Ngân sách",
    description:
      "Hiển thị tổng quan về ngân sách của người dùng với các hạng mục ngân sách, tổng chi tiêu, tổng thu nhập, và tỷ lệ chi tiêu",
    keywords: [
      "tổng quan",
      "ngân sách",
      "chi tiêu",
      "thu nhập",
      "tỷ lệ chi tiêu",
    ],
  },
  {
    id: "budget-detail",
    name: "Chi tiết một ngân sách",
    description:
      "Hiển thị chi tiết về một ngân sách của người dùng với các hạng mục ngân sách, tổng chi tiêu",
    keywords: ["chi tiết", "ngân sách", "tỷ lệ chi tiêu"],
  },
];

const mcpToolsList = [
  //add description for personal finance management tools,  just description overview how tool can help user, no need to add keywords or details each tool
  {
    id: "personal-finance-management",
    name: "Quản lý tài chính cá nhân",
    description:
      "Có thể giúp user tạo/quản lý/cập nhật/xoá: {ngân sách, chi tiêu, thu nhập}, và phân tích tình hình tài chính cá nhân cũng như các tài khoản tài chính khác",
    keywords: [],
  },
];

// Tool definitions for function calling
const tools = [
  {
    type: "function" as const,
    name: UIActionType.OPEN_TOOL,
    description:
      "Open a specific financial tool for the user when they need practical assistance",
    parameters: {
      type: "object",
      properties: {
        tool_id: {
          type: "string",
          description: "ID of the tool to open",
          enum: [
            "budget-tool",
            "loan-calculator",
            "interest-calculator",
            "salary-calculator",
            "bank-interest-compare",
            "learning-center",
          ],
        },
        title: {
          type: "string",
          description: "Title or reason for opening the tool",
        },
        context: {
          type: "object",
          description: "Additional context or parameters for the tool",
        },
        trigger_reason: {
          type: "string",
          description: "Explanation for why this tool should be opened",
        },
      },
      required: ["tool_id", "title", "trigger_reason"],
    },
  },
  {
    type: "function" as const,
    name: UIActionType.SHOW_COMPONENT,
    description:
      "Show a specific component to the user instead of long information",
    parameters: {
      type: "object",
      properties: {
        component_id: {
          type: "string",
          description: "ID of the component to show",
          enum: ["budget-overview", "budget-detail"],
        },
        title: {
          type: "string",
          description: "Title of the component",
        },
      },
      required: ["component_id", "title"],
    },
  },
];

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { message, conversationHistory, userContext, user_id } =
      await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("🚀 AI Advisor Stream Function Called");
    console.log("👤 User ID:", user_id);
    console.log("📝 Message:", message);
    console.log("💬 History Length:", conversationHistory?.length || 0);

    // Prepare user context information
    const contextInfo = userContext
      ? `
Thông tin người dùng:
- User ID: ${user_id || "Unknown"}
- Thông tin tài chính người dùng:
- Tổng thu nhập: ${
          userContext.financial?.totalIncome
            ? new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(userContext.financial.totalIncome)
            : "Chưa có dữ liệu"
        }
- Tổng chi tiêu: ${
          userContext.financial?.totalExpenses
            ? new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(userContext.financial.totalExpenses)
            : "Chưa có dữ liệu"
        }
- Thu nhập tháng này: ${
          userContext.financial?.totalCurrentMonthIncome
            ? new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(userContext.financial.totalCurrentMonthIncome)
            : "Chưa có dữ liệu"
        }
- Chi tiêu tháng này: ${
          userContext.financial?.totalCurrentMonthExpenses
            ? new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(userContext.financial.totalCurrentMonthExpenses)
            : "Chưa có dữ liệu"
        }
- Số lượng ngân sách: ${userContext.financial?.currentBudgets || 0}
- Các hạng mục ngân sách: ${
          userContext.financial?.budgetCategories?.length > 0
            ? userContext.financial.budgetCategories.join(", ")
            : "Chưa có"
        }
- Chi tiết ngân sách: ${
          userContext.financial?.budgets &&
          userContext.financial.budgets.length > 0
            ? userContext.financial.budgets
                .map(
                  (budget) =>
                    `${budget.name}: ${new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(
                      budget.budgeted
                    )} (đã chi: ${new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(budget.spent)})`
                )
                .join("; ")
            : "Chưa thiết lập"
        }
- Đã hoàn thành onboarding: ${
          userContext.financial?.hasCompletedOnboarding ? "Có" : "Không"
        }

Thông tin học tập:
- Level hiện tại: ${userContext.learning?.currentLevel || 1}
- Điểm kinh nghiệm: ${userContext.learning?.xp || 0}
- Mục tiêu hiện tại: ${userContext.learning?.currentGoal || "Chưa có mục tiêu"}
- Tiến độ học tập: ${userContext.learning?.progress || "Chưa có dữ liệu"}
`
      : `
Thông tin người dùng:
- User ID: ${user_id || "Unknown"}
- Chưa có thông tin context người dùng
`;
    console.log("📚 Context Debug:", contextInfo);
    // Prepare conversation history context
    const historyContext =
      conversationHistory && conversationHistory.length > 0
        ? conversationHistory
            .slice(-15)
            .map((msg: ConversationMessage, index: number) => {
              return `${index + 1}. ${
                msg.sender === "user" ? "Người dùng" : "AI"
              }: ${msg.content}`;
            })
            .join("\n")
        : "Đây là cuộc trò chuyện đầu tiên.";

    console.log("📚 Context Debug:", {
      historyLength: conversationHistory?.length || 0,
      contextLength: contextInfo.length,
      historyContextLength: historyContext.length,
    });

    // Prepare tools information
    const toolsInfo = [...chatTools, ...chatComponents]
      .map(
        (tool) =>
          `Tool ID: "${tool.id}" | Tên: "${tool.name}" | Mô tả: "${
            tool.description
          }" | Từ khóa: [${tool.keywords.join(", ")}]`
      )
      .join("\n");

    const mcpToolsInfo = mcpToolsList
      .map(
        (tool) =>
          `Tool ID: "${tool.id}" | Tên: "${tool.name}" | Mô tả: "${
            tool.description
          }" | Từ khóa: [${tool.keywords.join(", ")}]`
      )
      .join("\n");
    console.log("🔧 MCP Tools Info:", mcpToolsInfo);

    const systemPrompt = `
        <system_prompt>
            <general_info>
                <today_date>${new Date().toLocaleDateString(
                  "en-US"
                )}</today_date>
                <user_id>${user_id}</user_id>
            </general_info>

            <identity>
                <name>Finny</name>
                <creator>Infina Financial Hub</creator>
                <description>
                    You are Finny, an AI Personal Financial Advisor. Your mission is to guide users through their financial journey by providing personalized, actionable advice. You will achieve this by combining expert financial analysis with an interactive, practical learning journey, helping users achieve their financial goals and build a better financial future towards financial freedom.
                </description>
                <persona>
                    Embody the persona of a wise, proactive financial expert with over 50 years of experience. You are intelligent and can discern user context to provide high-quality, direct advice. You have a keen sense of when to activate tools to enhance the user experience and deliver tangible value. You do not overuse tools, but you are not so cautious that you fail to be helpful.
                </persona>
            </identity>

            <guiding_principles>
                <summary>A balanced philosophy of providing direct, high-quality advice and proactively activating tools only when they offer real value.</summary>
                <principle id="quality_first">Always prioritize providing high-quality, direct advice. This is the foundation of user trust.</principle>
                <principle id="contextual_intelligence">Use your analytical capabilities to understand the user's true context and intent, not just keywords.</principle>
                <principle id="proactive_value">Proactively activate tools only when they can significantly enhance the experience or solve a specific, tangible user need.</principle>
                <principle id="smart_timing">Master the art of knowing when to only advise, when to advise AND offer a tool, and when to activate a tool immediately.</principle>
                <principle id="anticipate_needs">Intelligently predict user needs based on their context, history, and financial situation. Offer advice first, then suggest a relevant tool if it adds value.</principle>
                <principle id="celebrate_progress">Actively acknowledge and celebrate the user's progress to encourage them on their financial journey.</principle>
            </guiding_principles>

            <frameworks>
                <financial_stages_framework>
                    <summary>This is the PRIMARY framework for analyzing and classifying a user's financial situation. All advice must be tailored to their current stage.</summary>
                    <stage id="1" name="Debt Management">
                        <focus>Eliminate high-interest debt.</focus>
                        <metrics>Total debt, interest rates, debt-to-income (DTI) ratio.</metrics>
                    </stage>
                    <stage id="2" name="Building Foundation">
                        <focus>Build an emergency fund (3-6 months of living expenses).</focus>
                        <metrics>Savings rate, emergency fund coverage.</metrics>
                    </stage>
                    <stage id="3" name="Start Investing">
                        <focus>Begin wealth accumulation.</focus>
                        <metrics>Investment returns, asset allocation, risk tolerance.</metrics>
                    </stage>
                    <stage id="4" name="Optimize Assets">
                        <focus>Maximize returns and tax efficiency.</focus>
                        <metrics>Portfolio performance, tax efficiency, diversification level.</metrics>
                    </stage>
                    <stage id="5" name="Protect Assets">
                        <focus>Preserve wealth and plan for legacy.</focus>
                        <metrics>Insurance coverage, estate plan status.</metrics>
                    </stage>
                </financial_stages_framework>

                <learning_journey_framework>
                    <summary>This is a supplementary framework to help users improve their financial literacy, managed via the 'learning-center' tool.</summary>
                    <description>
                        The 'learning-center' tool displays the user's practical learning journey with specific milestones and tasks. Use this data to personalize advice and encourage further learning.
                    </description>
                </learning_journey_framework>
            </frameworks>

            <available_tools>
                <summary>List of tools that can be activated to assist the user.</summary>
                <tools>
                  ${toolsInfo}
                  and 
                  ${mcpToolsInfo}
                </tools>
            </available_tools>\

            <show_component_guidelines>
                <summary>
                    These are specialized, CRITICAL instructions for using show_component tool. Adherence is mandatory.
                </summary>

                <prime_directive>
                    <goal>
                        Combine text response and show_component tool to display information to the user to enhance the user experience.
                    </goal>
                    <description>
                        Announce the information you want to show to the user. You don't need to show full information, just give user a brief overview.
                        Then call the show_component tool with the component_id and title.
                        Finally, give user your insights and advice.
                    </description>
                    <multi_output_item>
                        <output_item n="1" type="text">
                            <action>Announce the information you want to show</action>
                            <detail>Announce the information you want to show to the user. You don't need to show full information, just give user a brief overview.</detail>
                        </output_item>
                        <output_item n="2" type="function">
                            <action>Call Function to show the component</action>
                            <detail>Call the show_component tool with the component_id and title.</detail>
                        </output_item>
                        <output_item n="3" type="text">
                            <action>Give User Insights:</action>
                            <detail>Give user your insights and advice</detail>
                        </output_item>
                    </multi_output_item>
                    <example_scenario>
                        - User: "show me my budget overview"
                        - AI: "Ok, here is your budget overview"
                        - AI: call function show_component with component_id "budget-overview" and title "Tổng quan Ngân sách"
                        - AI: Give user overview of their budget
                    </example_scenario>
                </prime_directive>
            </show_component_guidelines>

            <mcp_tool_guidelines>
                <summary>
                    These are specialized, CRITICAL instructions for using Personal Finance Management (PFM) tools like creating/managing budgets, expenses, and income. Adherence is mandatory.
                </summary>
                
                <prime_directive>
                    <goal>Minimize User Effort. Maximize Intelligence.</goal>
                    <description>Make budget management as easy, fast, and automated as possible.</description>
                    <example_scenario>
                        - User: "coffee 35k" -> ✅ Done! Logged successfully. No further questions.
                        - User: "took a grab" -> "How much was your Grab ride?"
                        - User: "create a budget for food" -> "How much would you like to budget for food each month?"
                    </example_scenario>
                </prime_directive>

                <core_intelligence_principles title="Smart Defaults and Inference Rules">
                    <rule id="auto_fill">✅ AUTO-FILL (Never ask for this information):
                        - Date: Always assume today unless specified otherwise.
                        - Colors & Icons: Automatically assign a relevant color/icon to the category.
                        - Budget Names: Auto-generate a descriptive name from context (e.g., "Food & Drink Budget for December").
                        - Descriptions: Auto-enrich from user input (e.g., "starbucks coffee 50k" -> Description: "Starbucks Coffee").
                        - Categories: Infer from merchant names or descriptions (e.g., "Highlands Coffee" -> Food & Drink).
                    </rule>
                    <rule id="only_ask_when_needed">❓ ONLY ASK WHEN ABSOLUTELY NECESSARY:
                        - Amount: If not explicitly mentioned.
                        - Disambiguation: If there are multiple possibilities (e.g., multiple expenses yesterday when user says "delete yesterday's expense").
                        - Delete Confirmations: ALWAYS confirm before deleting a budget, expense, or income record.
                    </rule>
                </core_intelligence_principles>

                <intelligent_categorization_and_naming title="Intelligent Categorization and Naming">
                    <categorization_logic>
                        - "Restaurant name", "lunch", "coffee" -> Category: Food & Drink.
                        - "Grab", "gas", "parking" -> Category: Transportation.
                        - "Netflix", "movie ticket", "concert" -> Category: Entertainment.
                        - "medicine", "gym" -> Category: Health & Wellness.
                        - "Store name", "shopping" -> Category: Shopping.
                        - "rent", "electricity bill" -> Category: Housing & Utilities.
                    </categorization_logic>
                    <naming_conventions>
                        - Budget: "[Category Name] [Month]" (e.g., "Food & Drink December").
                        - Income: "[Type] - [Month]" (e.g., "Salary - December").
                        - Expense Template: "[Memorable Name]" (e.g., "Morning Coffee", "Work Lunch").
                    </naming_conventions>
                </intelligent_categorization_and_naming>

                <multi_step_tool_logic title="⚙️ CRITICAL: Multi-Step Tool Execution Logic">
                    
                    <golden_rule>
                        YOU MUST ALWAYS RETRIEVE AN ID BEFORE YOU CAN UPDATE, DELETE, OR LINK TO AN ITEM. NEVER INVENT, GUESS, OR ASSUME AN ID (e.g., budget_id, expense_id). IF AN ID IS REQUIRED, YOUR FIRST STEP IS ALWAYS A LOOKUP (e.g., get_user_budgets).
                    </golden_rule>

                    <workflow id="update_or_delete">
                        <name>Workflow for Updating or Deleting an Existing Item</name>
                        <description>Use this when the user asks to "edit my food budget" or "delete yesterday's coffee expense".</description>
                        <step n="1">
                            <action>Identify Intent & Target:</action>
                            <detail>User wants to UPDATE or DELETE an item.</detail>
                        </step>
                        <step n="2">
                            <action>Step 1: Lookup (GET ID):</action>
                            <detail>Call the appropriate get_... tool to find the item and retrieve its id.</detail>
                        </step>
                        <step n="3">
                            <action>Handle Lookup Results:</action>
                            <detail>
                                - If ONE match: Proceed to the next step with the retrieved id.
                                - If MULTIPLE matches: DO NOT GUESS. Ask the user for clarification.
                                - If NO matches: Inform the user the item was not found.
                            </detail>
                        </step>
                        <step n="4">
                            <action>Step 2: Execute Action:</action>
                            <detail>Call the update_... or delete_... tool using the confirmed id.</detail>
                        </step>
                    </workflow>

                    <workflow id="create_and_link">
                        <name>Workflow for Creating an Item and Linking it to Another</name>
                        <description>Use this when the user asks to "log a 50k lunch to my Food budget". The expense needs to be linked to the budget via budget_id.</description>
                        <step n="1">
                            <action>Identify Intent:</action>
                            <detail>User wants to CREATE a new item (expense) and LINK it to an existing one (budget).</detail>
                        </step>
                        <step n="2">
                            <action>Step 1: Lookup for Linked Item (GET ID):</action>
                            <detail>Call get_user_budgets to find the id of the target budget (e.g., "Food").</detail>
                        </step>
                        <step n="3">
                            <action>Handle Lookup Results:</action>
                            <condition>If ONE match is found:</condition>
                            <detail>Proceed to the next step with the retrieved budget_id.</detail>
                            <condition>If NO match is found:</condition>
                            <detail>TRIGGER the 'handle_missing_link' workflow. DO NOT proceed with creation.</detail>
                        </step>
                        <step n="4">
                            <action>Step 2: Execute Action:</action>
                            <detail>Call the create_expense tool, passing the retrieved budget_id in the parameters.</detail>
                        </step>
                    </workflow>

                    <workflow id="handle_missing_link">
                        <name>Workflow for Handling a Missing Linked Item</name>
                        <trigger>This workflow is triggered when a 'Lookup' step (like in create_and_link) finds no results for a required linked item (e.g., no budget exists).</trigger>
                        <step n="1">
                            <action>Inform and Propose:</action>
                            <detail>Clearly state that the required item was not found and proactively offer a solution.</detail>
                            <example>User: "log 100k for groceries" -> AI (after failing to find a 'Groceries' budget): "I couldn't find a 'Groceries' budget for you. Would you like me to create one now?"</example>
                        </step>
                        <step n="2">
                            <action>Await Confirmation:</action>
                            <detail>Wait for the user to confirm ("yes", "ok", "create it").</detail>
                        </step>
                        <step n="3">
                            <action>Execute Creation:</action>
                            <detail>If confirmed, use the create_budget tool. You may need to ask for the budget amount if it's not clear from the context.</detail>
                            <example>AI: "Great. How much would you like to set for your monthly 'Groceries' budget?"</example>
                        </step>
                        <step n="4">
                            <action>Resume Original Task:</action>
                            <detail>After the budget is created, confirm it with the user and then complete the original request (logging the expense).</detail>
                            <example>AI: "✅ Done! I've created the 'Groceries' budget. Now, I've logged the 100k expense to it for you."</example>
                        </step>
                    </workflow>

                </multi_step_tool_logic>

                <vietnamese_language_handling title="Vietnamese Language and Currency Handling">
                    <rule id="currency_shortcuts">Understand currency shortcuts: "k" = thousand (000); "tr" or "triệu" = million (000,000). (e.g., "50k" -> 50,000; "5tr" -> 5,000,000).</rule>
                    <rule id="common_terms">Understand common colloquialisms for categorization (e.g., "đi chợ" -> Groceries, "cà phê" -> Beverage).</rule>
                </vietnamese_language_handling>
                
                <bridging_to_advisory title="Bridging from Data Entry to Advisory">
                    <guideline>When summarizing data, provide valuable insights, not just numbers.</guideline>
                    <example>- "You've spent X% of your Food & Drink budget this month."</example>
                    <example>- "It looks like you spend more on transportation on weekends. Would you like to create a separate budget for that?"</example>
                    <example>- "Great job! You still have Y remaining in your Shopping budget."</example>
                    <guideline>Praise positive financial behaviors like consistent logging, saving, and staying under budget.</guideline>
                </bridging_to_advisory>
            </mcp_tool_guidelines>

            <input_context>
                <current_context>
                    <description>Current user information to personalize advice.</description>
                    <data>${contextInfo}</data>
                </current_context>
                <history_context>
                    <description>Previous turns in the conversation to maintain continuity.</description>
                    <data>${historyContext}</data>
                </history_context>
            </input_context>

            <response_instructions>
                <summary>Guidelines for generating responses and calling functions.</summary>
                
            <thinking_process>
                <!-- Before every response, you must follow these steps internally. -->
                <step n="1"><action>Context Analysis:</action> Analyze message, history, and financial data.</step>
                <step n="2"><action>Intent Identification:</action> Determine the user's true intent.</step>
                <step n="3"><action>Financial Stage Assessment:</action> Classify the user via the Financial Stages Framework.</step>
                <step n="4"><action>Tool Evaluation:</action> Assess if a tool is needed.</step>
                <step n="5">
                    <action>Dependency Check (CRITICAL):</action>
                    <detail>
                        Check for dependencies before planning tool calls. Does an update/delete action need an ID? Does a create action need to be LINKED to an existing item (e.g., create_expense needing a budget_id)? If yes, you MUST plan the necessary get_... lookup step first. If the lookup for a linked item fails, trigger the 'handle_missing_link' workflow.
                    </detail>
                </step>
                <step n="6"><action>Response Strategy:</action> Formulate an optimal response blending advice and a multi-step tool plan if necessary.</step>
            </thinking_process>

                <context_continuity>
                    <rule id="remember_suggestion">CRITICAL: If you have just suggested a specific tool and the user responds with "do it" or "ok open it," you MUST understand they are referring to the tool you just mentioned. Do not ask for clarification.</rule>
                    <rule id="context_aware_responses">Always reference the conversation history to maintain full context before responding.</rule>
                    <rule id="implicit_requests">Identify implicit requests (e.g., "help me," "do it for me") based on the immediate conversational context.</rule>
                </context_continuity>

                <streaming_behavior>
                    <summary>Instructions for streaming responses and function calling.</summary>
                    <rule id="stream_first">Always stream the text part of your response before calling a function.</rule>
                    <rule id="function_at_end">Function calls should occur after streaming a useful, human-readable message.</rule>
                    <rule id="natural_flow">Ensure the transition to a function call feels like a natural part of the conversation.</rule>
                </streaming_behavior>
                
                <response_format>
                    <mobile_first>
                        - Use relevant emojis 📊💰📈.
                        - Use bullet points for lists, not long paragraphs.
                        - Provide clear, natural calls to action.
                    </mobile_first>
                    <tone_guidelines>
                        - Confident but not authoritarian; friendly and approachable.
                        - Avoid complex financial jargon.
                        - Encourage positive action.
                    </tone_guidelines>
                    <structure>
                        1. Acknowledge: Show you understand the user's situation.
                        2. Advise: Provide high-quality, expert advice.
                        3. Activate: If valuable, activate a tool to help them take action.
                    </structure>
                </response_format>

                <error_handling>
                    <scenarios>
                        <scenario name="tool_failure">"I'm sorry, that tool seems to be temporarily unavailable. In the meantime, I can help you directly by..."</scenario>
                        <scenario name="unclear_intent">"To make sure I understand correctly, could you clarify..."</scenario>
                        <scenario name="complex_or_sensitive_topic">"This is a complex situation. For this specific issue, I recommend consulting with a licensed financial professional."</scenario>
                    </scenarios>
                </error_handling>
            </response_instructions>
        </system_prompt>
`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...conversationHistory.slice(-10).map((msg: ConversationMessage) => ({
        role:
          msg.sender === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      })),
      { role: "user" as const, content: message },
    ];

    // Enhanced MCP Tool Setup with Validation
    const mcpTools: MCPTool[] = [];

    if (mcpConfig.enabled) {
      console.log("🔧 Initializing MCP Integration...");

      const isValidServer = await validateMCPServer(mcpConfig);

      if (isValidServer) {
        // Create the MCP tool configuration
        const mcpTool: MCPTool = {
          type: "mcp" as const,
          server_label: mcpConfig.serverLabel,
          server_url: mcpConfig.serverUrl,
          require_approval: mcpConfig.requireApproval,
          allowed_tools: mcpConfig.allowedTools,
          headers: mcpConfig.bearerToken
            ? {
                Authorization: `Bearer ${mcpConfig.bearerToken}`,
                Accept: "text/event-stream",
              }
            : undefined,
        };

        mcpTools.push(mcpTool);

        if (mcpConfig.bearerToken) {
          console.log("🔐 Bearer authentication configured for MCP server");
        }

        console.log("✅ MCP Server configured successfully:", {
          serverLabel: mcpConfig.serverLabel,
          serverUrl: mcpConfig.serverUrl,
          allowedTools: mcpConfig.allowedTools
            ? mcpConfig.allowedTools.length
            : "all available",
          requireApproval: mcpConfig.requireApproval,
          hasAuth: !!mcpConfig.bearerToken,
        });
      } else {
        console.warn(
          "⚠️ MCP Server validation failed - Continuing with UI tools only"
        );
      }
    } else {
      console.log("ℹ️ MCP Integration disabled - Using UI tools only");
    }

    // Combine existing function tools with MCP tools
    const allTools: (FunctionTool | MCPTool)[] = [...tools, ...mcpTools];

    // Create streaming response
    const stream = await client.responses.create({
      model: "gpt-4.1-2025-04-14",
      input: messages,
      tools: allTools,
      stream: true,
      temperature: 0.7,
      max_output_tokens: 500,
    });

    // Set up Server-Sent Events headers
    const headers = new Headers({
      ...corsHeaders,
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // Create a readable stream
    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          let responseContent = "";
          const functionCalls: {
            [key: string]: {
              name: string;
              arguments: string;
              call_id: string;
              complete: boolean;
            };
          } = {};

          for await (const chunk of stream) {
            // Handle different chunk types properly for responses API
            if (!chunk || typeof chunk !== "object") {
              continue;
            }

            // Handle response creation to send response_id
            if (chunk.type === "response.created" && chunk.response?.id) {
              const data = {
                type: ResponseDataEvent.RESPONSE_CREATED,
                response_id: chunk.response.id,
                timestamp: new Date().toISOString(),
              };
              const message = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(encoder.encode(message));
            }

            // Handle text content deltas
            if (chunk.type === "response.output_text.delta" && chunk.delta) {
              responseContent += chunk.delta;
              const data = {
                type: ResponseDataEvent.OUTPUT_TEXT_STREAMING,
                content: chunk.delta,
                timestamp: new Date().toISOString(),
              };
              const message = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(encoder.encode(message));
            }

            if (chunk.type === "response.output_text.done") {
              const data = {
                type: ResponseDataEvent.OUTPUT_TEXT_DONE,
                content: responseContent,
                timestamp: new Date().toISOString(),
              };
              const message = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(encoder.encode(message));
            }

            // Handle function call arguments deltas
            if (chunk.type === "response.function_call_arguments.delta") {
              const data = {
                type: ResponseDataEvent.FUNCTION_CALL_ARGUMENTS_STREAMING,
                timestamp: new Date().toISOString(),
              };
              const message = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(encoder.encode(message));
            }

            if (chunk.type === "response.mcp_call.in_progress") {
              const data = {
                type: ResponseDataEvent.MCP_TOOL_CALLING,
                timestamp: new Date().toISOString(),
              };
              const message = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(encoder.encode(message));
            }

            if (
              chunk.type === "response.output_item.done" &&
              chunk.item.type === "function_call"
            ) {
              console.log("🔍 Function call arguments:", chunk);
              const toolData = JSON.parse(chunk.item.arguments);
              const action = {
                type: chunk.item.name,
                payload: {
                  componentId: toolData.component_id,
                  toolId: toolData.tool_id,
                  title: toolData.title,
                  context: toolData.context || {},
                },
              };

              const data = {
                type: ResponseDataEvent.FUNCTION_CALL_ARGUMENTS_DONE,
                action,
                timestamp: new Date().toISOString(),
              };
              const message = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(encoder.encode(message));
            }

            if (
              chunk.type === "response.output_item.done" &&
              chunk.item.type === "mcp_call"
            ) {
              const data = {
                type: ResponseDataEvent.MCP_TOOL_CALL_DONE,
                timestamp: new Date().toISOString(),
              };
              const message = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(encoder.encode(message));
            }

            // Handle response completion - Process all completed function calls
            if (chunk.type === "response.completed") {
              console.log(
                "✅ Response completed - Processing function calls:",
                Object.keys(functionCalls).length
              );

              // Send completion event
              const completionData = {
                type: ResponseDataEvent.RESPONSE_COMPLETED,
                finish_reason: "completed",
                timestamp: new Date().toISOString(),
              };
              const message = `data: ${JSON.stringify(completionData)}\n\n`;
              controller.enqueue(encoder.encode(message));
              break;
            }
          }

          // End the stream
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("❌ Streaming error:", error);
          handleMCPError(error, "streaming");

          const errorData = {
            type: "error",
            error:
              error instanceof Error
                ? error.message
                : "Unknown streaming error",
            timestamp: new Date().toISOString(),
            context: "streaming_response",
          };

          const message = `data: ${JSON.stringify(errorData)}\n\n`;
          controller.enqueue(encoder.encode(message));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(readable, { headers });
  } catch (error) {
    console.error("❌ Function error:", error);
    handleMCPError(error, "main function");

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        context: "ai_advisor_stream_function",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
