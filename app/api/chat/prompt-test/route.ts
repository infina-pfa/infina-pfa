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
    </available_tools>`;

  const response = await openai.responses.create({
    model: model,
    input: `<user_id>${userId}</user_id>\n\n${financialOverviewText}\n\n${userMessage}`,
    instructions: systemPrompt + toolInfo,
    temperature,
    tools: buildFunctionTools(chatToolIds, componentToolIds, mcpIds),
  });

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
