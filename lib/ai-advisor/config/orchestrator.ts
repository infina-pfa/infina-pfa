import { BudgetStyle, FinancialStage } from "@/lib/types/user.types";
import {
  STAGE_CONFIGURATIONS,
  StageToolConfiguration,
} from "./stage-configurations";
import { buildFunctionTools } from "../../prompts/tools";
import { Tool } from "../types";
import { identityPrompt } from "@/lib/prompts/core/identity.prompt";
import { guidingPrinciplePrompt } from "@/lib/prompts/core/guiding-principle.prompt";
import { completeInteractPrompt } from "@/lib/prompts/core/complete-interact.prompt";
import { responseInstructionPrompt } from "@/lib/prompts/core/response.prompt";

export class DynamicOrchestrator {
  /**
   * Get stage-specific prompt based on stage and budget style
   */
  static getStagePrompt(
    stage: FinancialStage,
    budgetStyle: BudgetStyle,
    context?: string,
    toolInfo?: string
  ): string {
    const config = STAGE_CONFIGURATIONS[stage];
    if (!config) {
      throw new Error(`No configuration found for stage: ${stage}`);
    }

    return config.prompts[budgetStyle](context, toolInfo);
  }

  /**
   * Get stage-specific tools based on stage and budget style
   */
  static getStageTools(
    stage: FinancialStage,
    budgetStyle: BudgetStyle
  ): StageToolConfiguration {
    const config = STAGE_CONFIGURATIONS[stage];
    if (!config) {
      throw new Error(`No configuration found for stage: ${stage}`);
    }

    return config.tools[budgetStyle];
  }

  /**
   * Get complete LLM configuration for a stage/style combination
   */
  static getLLMConfiguration(
    stage: FinancialStage,
    budgetStyle: BudgetStyle,
    context?: string
  ) {
    const stageTools = this.getStageTools(stage, budgetStyle);

    // Get tools info for prompt context
    const toolsInfo = this.getToolsInfo(stageTools.chatTools);
    const componentInfo = this.getComponentToolsInfo(stageTools.componentTools);
    const mcpInfo = this.getMcpToolsInfo(stageTools.mcpTools);

    // Get the stage-specific prompt
    const stagePrompt = this.getStagePrompt(
      stage,
      budgetStyle,
      context,
      toolsInfo
    );

    // Build function tools for OpenAI API
    const functionTools = buildFunctionTools(
      stageTools.chatTools,
      stageTools.componentTools,
      stageTools.mcpTools
    );

    return {
      stagePrompt,
      tools: functionTools,
      toolsInfo,
      componentInfo,
      mcpInfo,
      stageTools,
    };
  }

  /**
   * Get system prompt with stage-specific content
   */
  static getSystemPrompt(
    userId: string,
    stage: FinancialStage,
    budgetStyle: BudgetStyle,
    context?: {
      memory?: string;
      user?: string;
      financial?: string;
    }
  ): string {
    const llmConfig = this.getLLMConfiguration(
      stage,
      budgetStyle,
      context?.user
    );

    const today = new Date().toISOString();

    return `
  <system_prompt>
    <today_date>${today}</today_date>
    <user_context>
      <user_id>${userId}</user_id>
      <financial_stage>${stage}</financial_stage>
      <budget_style>${budgetStyle}</budget_style>
      <memory>${context?.memory || ""}</memory>
      <user_info>${context?.user || ""}</user_info>
      <financial_info>${context?.financial || ""}</financial_info>
    </user_context>
    <core_system_prompt>
      ${identityPrompt}
      ${guidingPrinciplePrompt}
      ${completeInteractPrompt}
      ${responseInstructionPrompt}
    </core_system_prompt>
    <stage_specific_prompt>
      ${llmConfig.stagePrompt}
    </stage_specific_prompt>
    <tools_info>
      <chat_tools>${llmConfig.toolsInfo}</chat_tools>
      <component_tools>${llmConfig.componentInfo}</component_tools>
      <mcp_tools>${llmConfig.mcpInfo}</mcp_tools>
    </tools_info>
  </system_prompt>
    `;
  }

  /**
   * Generate tools information for chat tools
   */
  private static getToolsInfo(chatTools: string[]): string {
    // This would be implemented based on your existing tool definitions
    return chatTools.map((toolId) => `Tool: ${toolId}`).join("\n");
  }

  /**
   * Generate tools information for component tools
   */
  private static getComponentToolsInfo(componentTools: string[]): string {
    return componentTools
      .map((componentId) => `Component: ${componentId}`)
      .join("\n");
  }

  /**
   * Generate tools information for MCP tools
   */
  private static getMcpToolsInfo(mcpTools: string[]): string {
    return mcpTools.map((mcpId) => `MCP: ${mcpId}`).join("\n");
  }

  /**
   * Get available tools for a specific stage/style combination
   */
  static getAvailableTools(
    stage: FinancialStage,
    budgetStyle: BudgetStyle
  ): Tool[] {
    const stageTools = this.getStageTools(stage, budgetStyle);

    return buildFunctionTools(
      stageTools.chatTools,
      stageTools.componentTools,
      stageTools.mcpTools
    );
  }

  /**
   * Validate that the orchestrator has all required configurations
   */
  static validateConfiguration(): boolean {
    try {
      const stages = Object.values(FinancialStage);
      const budgetStyles = Object.values(BudgetStyle);

      for (const stage of stages) {
        for (const budgetStyle of budgetStyles) {
          const config = this.getLLMConfiguration(stage, budgetStyle);
          if (!config.stagePrompt || !config.tools) {
            console.error(
              `Invalid configuration for ${stage} + ${budgetStyle}`
            );
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Configuration validation failed:", error);
      return false;
    }
  }
}
