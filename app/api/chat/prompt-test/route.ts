import { financialOverviewService } from "@/lib/ai-advisor/services";
import { openai } from "@/lib/openai";
import { buildFunctionTools, getToolsInfo } from "@/lib/prompts";
import { CHAT_TOOLS, MCP_TOOLS } from "@/lib/prompts/constant";
import {
  ChatComponentId,
  ChatToolId,
  MCPId,
} from "@/lib/types/ai-streaming.types";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
export async function POST(request: NextRequest) {
  const {
    userId,
    systemPrompt,
    userMessage,
    model,
    temperature,
    chatToolIds,
    componentToolIds,
    mcpIds,
  } = (await request.json()) as {
    userId: string;
    systemPrompt: string;
    userMessage: string;
    model: string;
    temperature: number;
    chatToolIds: ChatToolId[];
    componentToolIds: ChatComponentId[];
    mcpIds: MCPId[];
  };

  const supabase = await createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVER_ROLE_KEY!
  );

  const financialOverview = await financialOverviewService.getFinancialOverview(
    userId,
    undefined,
    supabase
  );

  const financialOverviewText =
    financialOverview !== null
      ? financialOverviewService.convertFinancialOverviewToText(
          financialOverview
        )
      : "";

  const toolInfo = `
        <available_tools>
      <summary>List of tools that can be activated to assist the user.</summary>
        <tools>
        ${getToolsInfo(
          chatToolIds.map((id) => CHAT_TOOLS.find((tool) => tool.id === id)!)
        )}
        and
        ${mcpIds.map((id) => MCP_TOOLS[id]).join("\n")}
        </tools>
    </available_tools>
    
    <multiple_tool_call_instructions>
        When a user requests multiple tools or components in sequence (e.g., "open A then open B", "show X and Y", "mở tool A sau đó mở tool B"), Please combine multiple requests into a single call.
        Examples:
        - "Hãy mở tool budget-detail sau đó mở tool budget-overview" → You need response to the user first, then call show_component("budget-detail"), after that call show_component("budget-overview")
    </multiple_tool_call_instructions>`;

  const response = await openai.responses.create({
    model: model,
    input: `<user_id>${userId}</user_id>\n\n${financialOverviewText}\n\n${userMessage}`,
    instructions: systemPrompt + toolInfo,
    temperature,
    tools: buildFunctionTools(chatToolIds, componentToolIds, mcpIds),
    parallel_tool_calls:true,
    tool_choice: "auto"
  });

  // Debug logging
  console.log("🔍 DEBUG INFO:");
  console.log("Model:", model);
  console.log("📤 User Message:", userMessage);
  console.log("🛠️ Available Tools Count:", buildFunctionTools(chatToolIds, componentToolIds, mcpIds).length);
  console.log("📊 Component Tool IDs:", componentToolIds);
  console.log("🔧 Function Calls Made:", response.output.filter(item => item.type === "function_call").length);
  console.log("📋 Function Calls Details:", response.output.filter(item => item.type === "function_call").map(fc => ({
    name: fc.name,
    arguments: fc.arguments
  })));

  //I need write all the response to a file
  fs.writeFileSync("response.json", JSON.stringify(response, null, 2));

  // console.log(response);

  return NextResponse.json({
    outputText: response.output_text,
    outputItems: response.output.filter(
      (item) => item.type !== "mcp_list_tools"
    ),
    functionCalls: response.output.filter(
      (item) => item.type === "function_call"
    ),
    mcpToolCalls: response.output.filter((item) => item.type === "mcp_call"),
  });
}
