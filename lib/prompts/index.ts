// Stage-specific utilities
import * as debtUtils from "./debt/utils";
import * as startInvestingUtils from "./start-investing/utils";
import * as startSavingUtils from "./start-saving/chat/utils";

// Configuration management
import { initializeStageConfigurations } from "../ai-advisor/config/stage-configurations";

// Initialize stage configurations with all utilities
initializeStageConfigurations(debtUtils, startSavingUtils, startInvestingUtils);

// Re-export utilities for external use
export { debtUtils, startInvestingUtils, startSavingUtils };

// Re-export configuration management
export {
  getStageConfiguration,
  STAGE_CONFIGURATIONS,
  validateStageConfigurations,
  type StageConfig,
  type StageConfigurations,
  type StageToolConfiguration,
} from "../ai-advisor/config/stage-configurations";

// Re-export orchestrator
export { DynamicOrchestrator } from "../ai-advisor/config/orchestrator";

// Re-export existing utilities
export {
  getComponentToolsInfo,
  getMcpToolsInfo,
  getStagePrompt,
  getToolsInfo,
} from "./utils";
export { buildFunctionTools } from "./tools";
