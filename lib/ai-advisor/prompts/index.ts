/**
 * Centralized exports for all AI Advisor prompt functions
 * Stage-specific prompts for optimized onboarding experience
 */

// Stage-specific prompt generators
export { generateDebtStagePrompt } from './debt-stage-prompt';
export { generateStartSavingStagePrompt } from './start-saving-stage-prompt';
export { generateStartInvestingStagePrompt } from './start-investing-stage-prompt';

// Original onboarding prompt (used for stage identification)
export { generateOnboardingSystemPrompt } from './onboarding-system-prompt';

// General AI advisor prompt
export { generateSystemPrompt } from './system-prompt';

// Prompt orchestrator - main entry point for onboarding
export { 
  generateStageSpecificPrompt,
  validateStageCompatibility,
  getStageProgression,
  logPromptSelection,
  type FinancialStage
} from './prompt-orchestrator';

/**
 * Stage-specific prompt mapping for easy reference
 */
export const STAGE_PROMPTS = {
  debt: 'debt-stage-prompt',
  start_saving: 'start-saving-stage-prompt', 
  start_investing: 'start-investing-stage-prompt',
  onboarding: 'onboarding-system-prompt'
} as const;

/**
 * Get all available financial stages
 */
export const FINANCIAL_STAGES = ['debt', 'start_saving', 'start_investing', 'none'] as const; 