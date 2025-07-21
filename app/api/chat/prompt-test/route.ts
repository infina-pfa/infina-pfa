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
// import fs from "fs";

// Type definitions for better type safety
interface FunctionCall {
  id: string;
  name: string;
  arguments: string;
  call_id: string;
  type: "function_call";
}

interface OutputItem {
  id?: string;
  type: string;
  name?: string;
  arguments?: string;
  call_id?: string;
}

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
    use_mcp = true, // Default to true if not provided
  } = (await request.json()) as {
    userId: string;
    systemPrompt: string;
    userMessage: string;
    model: string;
    temperature: number;
    chatToolIds: ChatToolId[];
    componentToolIds: ChatComponentId[];
    mcpIds: MCPId[];
    use_mcp?: boolean; // Optional parameter with default value
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

  // ✅ IMPROVED: More explicit instructions for multiple function calls
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
        IMPORTANT: When a user requests multiple tools or components (e.g., "open A then open B", "show X and Y", "mở tool A sau đó mở tool B"), you MUST make multiple function calls in the SAME response.
        
        DO NOT complete after the first function call. Continue calling additional functions as requested.
        
        Examples:
        - "Hãy mở tool budget-detail sau đó mở tool budget-overview" → Call BOTH show_component("budget-detail") AND show_component("budget-overview") in the same response
        - "Show my budget details and overview" → Call BOTH functions together
        - "First open A then open B" → Call both function_A() AND function_B() together
        
        CRITICAL: Use parallel function calling to fulfill ALL user requests in ONE response, not just the first one.
    </multiple_tool_call_instructions>`;

  console.log("🚀 Starting OpenAI Responses API with streaming...");
  console.log("📤 User Message:", userMessage);
  console.log("🛠️ Available Tools Count:", buildFunctionTools(chatToolIds, componentToolIds, mcpIds).length);
  console.log("📊 Component Tool IDs:", componentToolIds);
  console.log("🔧 MCP Tool IDs:", mcpIds);
  console.log("🎛️ Use MCP Tools:", use_mcp);

  // ✅ USE CLIENT-PROVIDED MCP SETTING instead of hardcoded value
  const finalMcpIds = use_mcp ? mcpIds : [];
  
  // ✅ ADD STREAMING MODE WITH IMPROVED SETTINGS
  const stream = await openai.responses.create({
    model: model,
    input: `<user_id>${userId}</user_id>\n\n${financialOverviewText}\n\n${userMessage}`,
    instructions: systemPrompt + toolInfo,
    temperature,
    tools: buildFunctionTools(chatToolIds, componentToolIds, finalMcpIds),
    parallel_tool_calls: true,
    tool_choice: "auto",
    stream: true
  });

  // Process streaming events and collect function calls with proper types
  let responseText = "";
  const functionCalls: FunctionCall[] = [];
  const mcpToolCalls: OutputItem[] = [];
  const outputItems: OutputItem[] = [];
  let responseCompleted = false;

  console.log("🌊 Processing streaming events...");

  try {
    for await (const event of stream) {
      // Collect text content
      if (event.type === "response.output_text.delta") {
        responseText += event.delta;
      }

      // Handle function call detection
      if (event.type === "response.output_item.added") {
        if (event.item?.type === "function_call") {
          console.log(`🔧 Function call detected: ${event.item.name} (ID: ${event.item.id})`);
          outputItems.push(event.item as OutputItem);
        }
        if (event.item?.type === "mcp_call") {
          console.log(`🔧 MCP call detected: ${event.item.name} (ID: ${event.item.id})`);
          outputItems.push(event.item as OutputItem);
        }
      }

      // Handle completed function calls
      if (event.type === "response.output_item.done") {
        if (event.item?.type === "function_call") {
          const functionCall: FunctionCall = {
            id: event.item.id || "",
            name: event.item.name || "",
            arguments: event.item.arguments || "",
            call_id: event.item.call_id || "",
            type: "function_call"
          };
          functionCalls.push(functionCall);
          console.log(`✅ Function call completed: ${event.item.name}`, {
            name: event.item.name,
            arguments: event.item.arguments
          });
        }
        
        if (event.item?.type === "mcp_call") {
          mcpToolCalls.push(event.item as OutputItem);
          console.log(`✅ MCP call completed: ${event.item.name}`);
        }
      }

      // Handle response completion
      if (event.type === "response.completed") {
        responseCompleted = true;
        console.log("🎯 Response completed!");
        break;
      }

      // Handle any errors
      if (event.type === "error") {
        console.error("❌ Streaming error:", event);
        throw new Error(`Streaming error: ${JSON.stringify(event)}`);
      }
    }
  } catch (error) {
    console.error("❌ Stream processing error:", error);
    throw error;
  }

  // Debug logging
  console.log("\n🎯 FINAL RESULTS:");
  console.log("📝 Response Text Length:", responseText.length);
  console.log("🔧 Total Function Calls Made:", functionCalls.length);
  console.log("📋 Function Calls Details:", functionCalls.map(fc => ({
    name: fc.name,
    arguments: fc.arguments
  })));
  console.log("🔗 MCP Tool Calls:", mcpToolCalls.length);
  console.log("📊 Total Output Items:", outputItems.length);
  console.log("✅ Response Completed:", responseCompleted);



  // // Create response object similar to non-streaming format
  // const response = {
  //   output_text: responseText,
  //   output: outputItems,
  //   // Add metadata for debugging
  //   streaming_metadata: {
  //     total_function_calls: functionCalls.length,
  //     total_mcp_calls: mcpToolCalls.length,
  //     response_completed: responseCompleted,
  //     mcp_tools_disabled: !use_mcp
  //   }
  // };

  // // Write full response to file for debugging
  // fs.writeFileSync("streaming_response.json", JSON.stringify({
  //   response,
  //   functionCalls,
  //   mcpToolCalls,
  //   outputItems,
  //   userMessage,
  //   analysis: {
  //     actualCalls: functionCalls.length,
  //     mcpDisabled: !use_mcp
  //   }
  // }, null, 2));

  return NextResponse.json({
    outputText: responseText,
    outputItems: outputItems.filter(
      (item) => item.type !== "mcp_list_tools"
    ),
    functionCalls: functionCalls,
    mcpToolCalls: mcpToolCalls,
    // Add debug info
    debug: {
      streamingEnabled: true,
      totalFunctionCalls: functionCalls.length,
      totalMcpCalls: mcpToolCalls.length,
      responseCompleted: responseCompleted,
      availableToolsCount: buildFunctionTools(chatToolIds, componentToolIds, finalMcpIds).length,
      mcpToolsDisabled: !use_mcp,
    }
  });
}