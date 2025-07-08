/**
 * Function definition for showing onboarding components in chat
 */
export const showOnboardingComponentTool = {
  type: "function" as const,
  function: {
    name: "show_onboarding_component",
    description: "Display an interactive component in the onboarding chat to collect specific user information. CRITICAL: You MUST provide ALL required parameters as valid JSON. Never call this function with empty arguments.",
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
          description: "Type of component to display - determines the UI component that will be rendered. REQUIRED: Must be one of the enum values."
        },
        title: {
          type: "string",
          description: "Clear, user-friendly title/question to display above the component. REQUIRED: Must be a meaningful question or instruction for the user."
        },
        component_id: {
          type: "string",
          description: "Unique identifier for this component instance. REQUIRED: Use format 'component_type_timestamp' (e.g. 'introduction_template_1751563582612')"
        },
        context: {
          type: "object",
          description: "Configuration data specific to the component type. REQUIRED: Must include appropriate properties based on component_type.",
          properties: {
            // Multiple choice - required for component_type: "multiple_choice"
            options: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", description: "Unique option identifier" },
                  label: { type: "string", description: "Display text for the option" },
                  value: { type: "string", description: "Value to be returned when selected" },
                  description: { type: "string", description: "Optional additional description" }
                },
                required: ["id", "label", "value"]
              },
              description: "Array of selectable options (REQUIRED for multiple_choice components). Must have at least 2 options."
            },
            
            // Rating scale - required for component_type: "rating_scale"
            scale: {
              type: "object",
              properties: {
                min: { type: "number", default: 1, description: "Minimum scale value" },
                max: { type: "number", default: 5, description: "Maximum scale value" },
                labels: {
                  type: "array",
                  items: { type: "string" },
                  description: "Labels for scale endpoints (e.g., ['Very Low', 'Very High'])"
                }
              },
              description: "Scale configuration (REQUIRED for rating_scale components)"
            },
            
            // Slider - required for component_type: "slider"
            range: {
              type: "object",
              properties: {
                min: { type: "number", description: "Minimum slider value" },
                max: { type: "number", description: "Maximum slider value" },
                step: { type: "number", default: 1, description: "Step increment" },
                unit: { type: "string", description: "Unit of measurement (e.g., '%', 'VND')" }
              },
              required: ["min", "max"],
              description: "Range configuration (REQUIRED for slider components)"
            },
            
            // Text input - optional for component_type: "text_input"
            placeholder: {
              type: "string",
              description: "Placeholder text for input field"
            },
            validation: {
              type: "object",
              properties: {
                required: { type: "boolean", default: true },
                minLength: { type: "number" },
                maxLength: { type: "number" }
              },
              description: "Input validation rules"
            },
            
            // Financial input - required for component_type: "financial_input"
            currency: {
              type: "string",
              default: "VND",
              description: "Currency code (e.g., VND, USD)"
            },
            inputType: {
              type: "string",
              enum: ["income", "expense", "debt", "savings"],
              description: "Type of financial data being collected (REQUIRED for financial_input)"
            },
            
            // Introduction template - optional for component_type: "introduction_template"
            template: {
              type: "string",
              description: "Example template text to guide user input"
            },
            suggestions: {
              type: "array",
              items: { type: "string" },
              description: "Quick suggestion buttons for user convenience"
            }
          }
        }
      },
      required: ["component_type", "title", "component_id", "context"],
      additionalProperties: false
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

/**
 * Get example function call for each component type
 */
export function getComponentExamples(): string {
  const timestamp = new Date().getTime();
  return `
- **Introduction Template Example**:
  \`\`\`json
  {
    "component_type": "introduction_template",
    "title": "Let's get to know each other! Please introduce yourself.",
    "component_id": "introduction_template_${timestamp}",
    "context": {
      "template": "My name is [Name], I'm [Age] years old, and I live in [City]. I work as a [Occupation]. My main financial goal is to [Goal].",
      "suggestions": ["Fill out my profile", "Tell me about my finances", "Let's start onboarding"]
    }
  }
  \`\`\`

- **Multiple Choice Example**:
  \`\`\`json
  {
    "component_type": "multiple_choice",
    "title": "What is your primary financial goal right now?",
    "component_id": "multiple_choice_${timestamp}",
    "context": {
      "options": [
        {"id": "goal_1", "label": "Save for a down payment", "value": "down_payment"},
        {"id": "goal_2", "label": "Pay off high-interest debt", "value": "pay_debt"},
        {"id": "goal_3", "label": "Build an emergency fund", "value": "emergency_fund"},
        {"id": "goal_4", "label": "Start investing for retirement", "value": "invest_retirement"}
      ]
    }
  }
  \`\`\`

- **Financial Input Example**:
  \`\`\`json
  {
    "component_type": "financial_input",
    "title": "What is your estimated monthly income?",
    "component_id": "financial_input_${timestamp}",
    "context": {
      "inputType": "income",
      "placeholder": "e.g., 25,000,000 VND",
      "currency": "VND"
    }
  }
  \`\`\`

- **Rating Scale Example**:
  \`\`\`json
  {
    "component_type": "rating_scale",
    "title": "On a scale of 1 to 5, how comfortable are you with investment risk?",
    "component_id": "rating_scale_${timestamp}",
    "context": {
      "scale": {
        "min": 1,
        "max": 5,
        "labels": ["Very Uncomfortable", "Very Comfortable"]
      }
    }
  }
  \`\`\`

- **Slider Example**:
  \`\`\`json
  {
    "component_type": "slider",
    "title": "What percentage of your income do you aim to save each month?",
    "component_id": "slider_${timestamp}",
    "context": {
      "range": {
        "min": 0,
        "max": 50,
        "step": 5,
        "unit": "%"
      }
    }
  }
  \`\`\`
  
- **Text Input Example**:
  \`\`\`json
  {
    "component_type": "text_input",
    "title": "What is your current occupation?",
    "component_id": "text_input_${timestamp}",
    "context": {
      "placeholder": "e.g., Software Engineer, Doctor, etc.",
      "validation": {
        "required": true,
        "minLength": 2
      }
    }
  }
  \`\`\`
`;
}

/**
 * Validate component arguments
 */
export function validateComponentArguments(args: unknown): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!args || typeof args !== 'object') {
    errors.push("Arguments must be a valid object");
    return { isValid: false, errors };
  }
  
  const argObj = args as Record<string, unknown>;
  
  // Check required fields
  if (!argObj.component_type) {
    errors.push("component_type is required");
  }
  
  if (!argObj.title) {
    errors.push("title is required");
  }
  
  if (!argObj.component_id) {
    errors.push("component_id is required");
  }
  
  if (!argObj.context || typeof argObj.context !== 'object') {
    errors.push("context object is required");
  }
  
  const context = argObj.context as Record<string, unknown>;
  
  // Validate component-specific requirements
  if (argObj.component_type === 'multiple_choice' && context) {
    if (!context.options || !Array.isArray(context.options) || context.options.length < 2) {
      errors.push("multiple_choice requires options array with at least 2 options");
    }
  }
  
  if (argObj.component_type === 'financial_input' && context) {
    if (!context.inputType) {
      errors.push("financial_input requires inputType in context");
    }
  }
  
  if (argObj.component_type === 'rating_scale' && context) {
    if (!context.scale) {
      errors.push("rating_scale requires scale configuration in context");
    }
  }
  
  if (argObj.component_type === 'slider' && context) {
    if (!context.range || typeof context.range !== 'object') {
      errors.push("slider requires range configuration with min/max in context");
    } else {
      const range = context.range as Record<string, unknown>;
      if (range.min === undefined || range.min === null || range.max === undefined || range.max === null) {
        errors.push("slider requires range configuration with min/max in context");
      }
    }
  }
  
  return { isValid: errors.length === 0, errors };
} 