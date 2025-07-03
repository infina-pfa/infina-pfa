/**
 * Function definition for showing onboarding components in chat
 */
export const showOnboardingComponentTool = {
  type: "function" as const,
  function: {
    name: "show_onboarding_component",
    description: "Display an interactive component in the onboarding chat to collect specific user information",
    parameters: {
      type: "object",
      properties: {
        component_type: {
          type: "string",
          enum: [
            "multiple_choice",
            "rating_scale", 
            "slider",
            "text_input",
            "financial_input",
            "goal_selector",
            "introduction_template"
          ],
          description: "Type of component to display"
        },
        title: {
          type: "string",
          description: "Title/question to display above the component"
        },
        context: {
          type: "object",
          description: "Configuration data for the component",
          properties: {
            // Multiple choice
            options: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  label: { type: "string" },
                  value: { type: "string" },
                  description: { type: "string" }
                },
                required: ["id", "label", "value"]
              },
              description: "Options for multiple choice component"
            },
            
            // Rating scale
            scale: {
              type: "object",
              properties: {
                min: { type: "number" },
                max: { type: "number" },
                labels: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              description: "Scale configuration for rating component"
            },
            
            // Slider
            range: {
              type: "object",
              properties: {
                min: { type: "number" },
                max: { type: "number" },
                step: { type: "number" },
                unit: { type: "string" }
              },
              description: "Range configuration for slider component"
            },
            
            // Text input
            placeholder: {
              type: "string",
              description: "Placeholder text for input"
            },
            validation: {
              type: "object",
              properties: {
                required: { type: "boolean" },
                minLength: { type: "number" },
                maxLength: { type: "number" }
              },
              description: "Validation rules for text input"
            },
            
            // Financial input
            currency: {
              type: "string",
              description: "Currency for financial input (e.g., VND, USD)"
            },
            inputType: {
              type: "string",
              enum: ["income", "expense", "debt", "savings"],
              description: "Type of financial input"
            },
            
            // Introduction template
            template: {
              type: "string",
              description: "Example template text"
            },
            suggestions: {
              type: "array",
              items: { type: "string" },
              description: "Quick suggestion options"
            }
          }
        },
        component_id: {
          type: "string",
          description: "Unique identifier for this component instance"
        }
      },
      required: ["component_type", "title"]
    }
  }
};

/**
 * Function definition for updating user profile during onboarding
 */
export const updateOnboardingProfileTool = {
  type: "function" as const,
  function: {
    name: "update_onboarding_profile",
    description: "Update user profile with information gathered during onboarding",
    parameters: {
      type: "object",
      properties: {
        profile_updates: {
          type: "object",
          description: "Profile fields to update",
          properties: {
            name: { type: "string" },
            age: { type: "number" },
            gender: { 
              type: "string",
              enum: ["male", "female", "other", "prefer_not_to_say"]
            },
            location: { type: "string" },
            income: { type: "number" },
            expenses: { type: "number" },
            currentDebts: { type: "number" },
            savings: { type: "number" },
            investmentExperience: {
              type: "string",
              enum: ["none", "beginner", "intermediate", "advanced"]
            },
            primaryFinancialGoal: { type: "string" },
            timeHorizon: {
              type: "string", 
              enum: ["short", "medium", "long"]
            },
            riskTolerance: {
              type: "string",
              enum: ["conservative", "moderate", "aggressive"] 
            }
          }
        }
      },
      required: ["profile_updates"]
    }
  }
};

/**
 * Function definition for analyzing financial stage
 */
export const analyzeFinancialStageTool = {
  type: "function" as const,
  function: {
    name: "analyze_financial_stage",
    description: "Analyze user's current financial situation to determine their appropriate financial stage",
    parameters: {
      type: "object",
      properties: {
        profile_data: {
          type: "object",
          description: "Complete user profile for analysis",
          properties: {
            income: { type: "number" },
            expenses: { type: "number" },
            debts: { type: "number" },
            savings: { type: "number" },
            investmentExperience: { type: "string" },
            riskTolerance: { type: "string" },
            primaryGoal: { type: "string" },
            age: { type: "number" }
          }
        },
        trigger_completion: {
          type: "boolean",
          description: "Whether to complete onboarding after analysis",
          default: false
        }
      },
      required: ["profile_data"]
    }
  }
};

/**
 * Function definition for completing the onboarding process
 */
export const completeOnboardingTool = {
  type: "function" as const,
  function: {
    name: "complete_onboarding",
    description: "Finalizes the user onboarding process after all necessary information has been gathered and analyzed.",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  }
};

/**
 * All onboarding function tools
 */
export const onboardingFunctionTools = [
  showOnboardingComponentTool,
  updateOnboardingProfileTool,
  analyzeFinancialStageTool,
  completeOnboardingTool
];

/**
 * Get tools info for onboarding system prompt
 */
export function getOnboardingToolsInfo(): string {
  return onboardingFunctionTools.map(tool => {
    const { name, description } = tool.function;
    return `- ${name}: ${description}`;
  }).join('\n');
} 