// Stage-specific utilities
import * as debtUtils from "./debt/utils";
import * as startSavingUtils from "./start-saving/chat/utils";
import * as startInvestingUtils from "./start-investing/utils";

// Configuration management
import { initializeStageConfigurations } from "../ai-advisor/config/stage-configurations";

// Initialize stage configurations with all utilities
initializeStageConfigurations(debtUtils, startSavingUtils, startInvestingUtils);

// Re-export utilities for external use
export { debtUtils, startSavingUtils, startInvestingUtils };

// Re-export configuration management
export {
  STAGE_CONFIGURATIONS,
  validateStageConfigurations,
  getStageConfiguration,
  type StageConfig,
  type StageConfigurations,
  type StageToolConfiguration,
} from "../ai-advisor/config/stage-configurations";

// Re-export orchestrator
export { DynamicOrchestrator } from "../ai-advisor/config/orchestrator";

// Re-export existing utilities
export { buildFunctionTools } from "./tools";
export {
  getToolsInfo,
  getComponentToolsInfo,
  getMcpToolsInfo,
  generateSystemPrompt,
  getStagePrompt,
} from "./system-prompt";
