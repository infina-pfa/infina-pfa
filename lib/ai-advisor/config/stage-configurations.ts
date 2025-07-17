import {
  ChatComponentId,
  ChatToolId,
  MCPId,
} from "@/lib/types/ai-streaming.types";
import { BudgetStyle, FinancialStage } from "@/lib/types/user.types";

export interface StageToolConfiguration {
  chatTools: ChatToolId[];
  componentTools: ChatComponentId[];
  mcpTools: MCPId[];
}

export interface StageConfig {
  prompts: {
    [key in BudgetStyle]: (context?: string, toolInfo?: string) => string;
  };
  tools: {
    [key in BudgetStyle]: StageToolConfiguration;
  };
  systemPrompt?: (context?: string) => string;
}

export type StageConfigurations = {
  [key in FinancialStage]: StageConfig;
};

// Stage utility interfaces
export interface StageUtilities {
  getDebtPrompt?: (options: {
    context?: string;
    toolInfo?: string;
    budgetStyle: BudgetStyle;
  }) => string;
  getDebtTools?: (options: {
    budgetStyle: BudgetStyle;
  }) => StageToolConfiguration;
  getStartSavingPrompt?: (options: {
    context?: string;
    toolInfo?: string;
    budgetStyle: BudgetStyle;
  }) => string;
  getStartSavingTools?: (options: {
    budgetStyle: BudgetStyle;
  }) => StageToolConfiguration;
  getStartInvestingPrompt?: (options: {
    context?: string;
    toolInfo?: string;
    budgetStyle: BudgetStyle;
  }) => string;
  getStartInvestingTools?: (options: {
    budgetStyle: BudgetStyle;
  }) => StageToolConfiguration;
}

// This will be populated after we create the stage-specific utilities
export const STAGE_CONFIGURATIONS: StageConfigurations =
  {} as StageConfigurations;

/**
 * Initialize stage configurations with all stage-specific utilities
 * This function is called after all stage utilities are imported
 */
export function initializeStageConfigurations(
  debtUtils: StageUtilities,
  startSavingUtils: StageUtilities,
  startInvestingUtils: StageUtilities
): void {
  if (debtUtils.getDebtPrompt && debtUtils.getDebtTools) {
    (STAGE_CONFIGURATIONS as Record<string, StageConfig>)[FinancialStage.DEBT] =
      {
        prompts: {
          [BudgetStyle.GOAL_FOCUSED]: (context?: string, toolInfo?: string) =>
            debtUtils.getDebtPrompt!({
              context,
              toolInfo,
              budgetStyle: BudgetStyle.GOAL_FOCUSED,
            }),
          [BudgetStyle.DETAIL_TRACKER]: (context?: string, toolInfo?: string) =>
            debtUtils.getDebtPrompt!({
              context,
              toolInfo,
              budgetStyle: BudgetStyle.DETAIL_TRACKER,
            }),
        },
        tools: {
          [BudgetStyle.GOAL_FOCUSED]: debtUtils.getDebtTools({
            budgetStyle: BudgetStyle.GOAL_FOCUSED,
          }),
          [BudgetStyle.DETAIL_TRACKER]: debtUtils.getDebtTools({
            budgetStyle: BudgetStyle.DETAIL_TRACKER,
          }),
        },
      };
  }

  if (
    startSavingUtils.getStartSavingPrompt &&
    startSavingUtils.getStartSavingTools
  ) {
    (STAGE_CONFIGURATIONS as Record<string, StageConfig>)[
      FinancialStage.START_SAVING
    ] = {
      prompts: {
        [BudgetStyle.GOAL_FOCUSED]: (context?: string, toolInfo?: string) =>
          startSavingUtils.getStartSavingPrompt!({
            context,
            toolInfo,
            budgetStyle: BudgetStyle.GOAL_FOCUSED,
          }),
        [BudgetStyle.DETAIL_TRACKER]: (context?: string, toolInfo?: string) =>
          startSavingUtils.getStartSavingPrompt!({
            context,
            toolInfo,
            budgetStyle: BudgetStyle.DETAIL_TRACKER,
          }),
      },
      tools: {
        [BudgetStyle.GOAL_FOCUSED]: startSavingUtils.getStartSavingTools({
          budgetStyle: BudgetStyle.GOAL_FOCUSED,
        }),
        [BudgetStyle.DETAIL_TRACKER]: startSavingUtils.getStartSavingTools({
          budgetStyle: BudgetStyle.DETAIL_TRACKER,
        }),
      },
    };
  }

  if (
    startInvestingUtils.getStartInvestingPrompt &&
    startInvestingUtils.getStartInvestingTools
  ) {
    (STAGE_CONFIGURATIONS as Record<string, StageConfig>)[
      FinancialStage.START_INVESTING
    ] = {
      prompts: {
        [BudgetStyle.GOAL_FOCUSED]: (context?: string, toolInfo?: string) =>
          startInvestingUtils.getStartInvestingPrompt!({
            context,
            toolInfo,
            budgetStyle: BudgetStyle.GOAL_FOCUSED,
          }),
        [BudgetStyle.DETAIL_TRACKER]: (context?: string, toolInfo?: string) =>
          startInvestingUtils.getStartInvestingPrompt!({
            context,
            toolInfo,
            budgetStyle: BudgetStyle.DETAIL_TRACKER,
          }),
      },
      tools: {
        [BudgetStyle.GOAL_FOCUSED]: startInvestingUtils.getStartInvestingTools({
          budgetStyle: BudgetStyle.GOAL_FOCUSED,
        }),
        [BudgetStyle.DETAIL_TRACKER]:
          startInvestingUtils.getStartInvestingTools({
            budgetStyle: BudgetStyle.DETAIL_TRACKER,
          }),
      },
    };
  }
}

/**
 * Validation function to ensure all combinations are covered
 */
export function validateStageConfigurations(): boolean {
  const stages = Object.values(FinancialStage);
  const budgetStyles = Object.values(BudgetStyle);

  for (const stage of stages) {
    const config = STAGE_CONFIGURATIONS[stage];
    if (!config) {
      console.error(`Missing configuration for stage: ${stage}`);
      return false;
    }

    for (const budgetStyle of budgetStyles) {
      if (!config.prompts[budgetStyle] || !config.tools[budgetStyle]) {
        console.error(`Missing configuration for ${stage} + ${budgetStyle}`);
        return false;
      }
    }
  }

  return true;
}

/**
 * Get configuration for a specific stage and budget style
 */
export function getStageConfiguration(
  stage: FinancialStage,
  budgetStyle: BudgetStyle
): {
  prompt: (context?: string, toolInfo?: string) => string;
  tools: StageToolConfiguration;
} {
  const config = STAGE_CONFIGURATIONS[stage];
  if (!config) {
    throw new Error(`No configuration found for stage: ${stage}`);
  }

  return {
    prompt: config.prompts[budgetStyle],
    tools: config.tools[budgetStyle],
  };
}
