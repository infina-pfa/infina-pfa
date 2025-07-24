/**
 * Function definition for showing onboarding components in chat
 */
export const showOnboardingComponentTool = {
  type: "function" as const,
  function: {
    name: "show_onboarding_component",
    description:
      "Display an interactive component in the onboarding chat to collect specific user information. CRITICAL: You MUST provide ALL required parameters as valid JSON. Never call this function with empty arguments.",
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
            "introduction_template",
            // New stage-first components
            "stage_selector",
            "decision_tree",
            "expense_categories",
            "savings_capacity",
            "goal_confirmation",
            "education_content",
            "suggestions",
            "infina_app_qr",
            "finish_onboarding",
            // Budget allocation enhancement components
            "budget_category_education",
            "budget_allocation_tool",
            "free_to_spend_choice",
            "budget_summary",
          ],
          description:
            "Type of component to display - determines the UI component that will be rendered. REQUIRED: Must be one of the enum values.",
        },
        title: {
          type: "string",
          description:
            "Clear, user-friendly title/question to display above the component. REQUIRED: Must be a meaningful question or instruction for the user.",
        },
        component_id: {
          type: "string",
          description:
            "Unique identifier for this component instance. REQUIRED: Use format 'component_type_timestamp' (e.g. 'stage_selector_1751563582612')",
        },
        context: {
          type: "object",
          description:
            "Configuration data specific to the component type. REQUIRED: Must include appropriate properties based on component_type.",
          properties: {
            // Multiple choice - required for component_type: "multiple_choice"
            options: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    description: "Unique option identifier",
                  },
                  label: {
                    type: "string",
                    description: "Display text for the option",
                  },
                  value: {
                    type: "string",
                    description: "Value to be returned when selected",
                  },
                  description: {
                    type: "string",
                    description: "Optional additional description",
                  },
                },
                required: ["id", "label", "value"],
              },
              description:
                "Array of selectable options (REQUIRED for multiple_choice components). Must have at least 2 options.",
            },

            // Rating scale - required for component_type: "rating_scale"
            scale: {
              type: "object",
              properties: {
                min: {
                  type: "number",
                  default: 1,
                  description: "Minimum scale value",
                },
                max: {
                  type: "number",
                  default: 5,
                  description: "Maximum scale value",
                },
                labels: {
                  type: "array",
                  items: { type: "string" },
                  description:
                    "Labels for scale endpoints (e.g., ['Very Low', 'Very High'])",
                },
              },
              description:
                "Scale configuration (REQUIRED for rating_scale components)",
            },

            // Slider - required for component_type: "slider"
            range: {
              type: "object",
              properties: {
                min: { type: "number", description: "Minimum slider value" },
                max: { type: "number", description: "Maximum slider value" },
                step: {
                  type: "number",
                  default: 1,
                  description: "Step increment",
                },
                unit: {
                  type: "string",
                  description: "Unit of measurement (e.g., '%', 'VND')",
                },
              },
              required: ["min", "max"],
              description:
                "Range configuration (REQUIRED for slider components)",
            },

            // Text input - optional for component_type: "text_input"
            placeholder: {
              type: "string",
              description: "Placeholder text for input field",
            },
            validation: {
              type: "object",
              properties: {
                required: { type: "boolean", default: true },
                minLength: { type: "number" },
                maxLength: { type: "number" },
              },
              description: "Input validation rules",
            },

            // Financial input - required for component_type: "financial_input"
            currency: {
              type: "string",
              default: "VND",
              description: "Currency code (e.g., VND, USD)",
            },
            inputType: {
              type: "string",
              enum: ["income", "expense", "debt", "savings"],
              description:
                "Type of financial data being collected (REQUIRED for financial_input)",
            },

            // Introduction template - optional for component_type: "introduction_template"
            template: {
              type: "string",
              description: "Example template text to guide user input",
            },
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    description: "Unique suggestion identifier",
                  },
                  text: {
                    type: "string",
                    description: "Display text for the suggestion button",
                  },
                  description: {
                    type: "string",
                    description: "Optional additional description",
                  },
                },
                required: ["id", "text"],
              },
              description:
                "Quick suggestion buttons for user convenience (REQUIRED for suggestions component)",
            },

            // Infina app QR - required for component_type: "infina_app_qr"

            // Infina app QR - required for component_type: "infina_app_qr"
            infinaAppQR: {
              type: "string",
              description: "Title for the Infina App QR code",
            },

            // NEW STAGE-FIRST COMPONENTS

            // Stage selector - required for component_type: "stage_selector"
            stages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    description:
                      "Financial stage identifier (debt, start_saving, start_investing)",
                  },
                  title: {
                    type: "string",
                    description: "Display title for the stage",
                  },
                  description: {
                    type: "string",
                    description: "Brief description of the stage",
                  },
                  criteria: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of criteria that define this stage",
                  },
                },
                required: ["id", "title", "description", "criteria"],
              },
              description:
                "Array of financial stages to choose from (REQUIRED for stage_selector)",
            },

            // Decision tree - required for component_type: "decision_tree"
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    description:
                      "Question identifier (e.g. high_interest_debt, emergency_fund)",
                  },
                  question: {
                    type: "string",
                    description: "The question text to display",
                  },
                  explanation: {
                    type: "string",
                    description: "Optional explanation or clarification",
                  },
                  yesLabel: {
                    type: "string",
                    description: "Custom label for Yes button (optional)",
                  },
                  noLabel: {
                    type: "string",
                    description: "Custom label for No button (optional)",
                  },
                },
                required: ["id", "question"],
              },
              description:
                "Array of decision tree questions to ask (REQUIRED for decision_tree)",
            },

            // Expense categories - required for component_type: "expense_categories"
            categories: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", description: "Category identifier" },
                  name: {
                    type: "string",
                    description: "Category display name",
                  },
                  placeholder: {
                    type: "string",
                    description: "Placeholder text for input",
                  },
                  required: {
                    type: "boolean",
                    description: "Whether this category is required",
                  },
                  defaultValue: {
                    type: "number",
                    description: "Default amount value for this category (optional)",
                  },
                },
                required: ["id", "name", "placeholder", "required"],
              },
              description:
                "Array of expense categories to collect (REQUIRED for expense_categories)",
            },
            allowAdditional: {
              type: "boolean",
              description:
                "Whether user can add additional expense categories (REQUIRED for expense_categories)",
            },

            // Savings capacity - optional for component_type: "savings_capacity"
            incomeHint: {
              type: "string",
              description: "Hint text about income assessment",
            },
            savingsHint: {
              type: "string",
              description: "Hint text about savings capacity",
            },

            // Goal confirmation - required for component_type: "goal_confirmation"
            goalDetails: {
              type: "object",
              properties: {
                amount: {
                  type: "number",
                  description: "Target emergency fund amount",
                },
                timeframe: {
                  type: "number",
                  description: "Timeline to achieve goal in months",
                },
                monthlyTarget: {
                  type: "number",
                  description: "Required monthly savings amount",
                },
              },
              required: ["amount", "timeframe", "monthlyTarget"],
              description:
                "Goal details for confirmation (REQUIRED for goal_confirmation)",
            },

            // Education content - required for component_type: "education_content"
            educationContent: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["video", "text"],
                  description: "Type of educational content",
                },
                title: {
                  type: "string",
                  description: "Title of the educational content",
                },
                content: {
                  type: "string",
                  description: "Main educational content text",
                },
                videoUrl: {
                  type: "string",
                  description: "URL for video content (if type is video)",
                },
                relatedActions: {
                  type: "array",
                  items: { type: "string" },
                  description: "Related action buttons for user interaction",
                },
              },
              required: ["type", "title", "content"],
              description:
                "Educational content structure (REQUIRED for education_content)",
            },

            // BUDGET ALLOCATION ENHANCEMENT COMPONENTS

            // Budget category education - optional for component_type: "budget_category_education"
            budgetCategories: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", description: "Category identifier" },
                  title: { type: "string", description: "Category title" },
                  description: {
                    type: "string",
                    description: "Category description",
                  },
                  priority: {
                    type: "number",
                    description: "Priority level (1-3)",
                  },
                  rules: {
                    type: "array",
                    items: { type: "string" },
                    description: "Rules for this category",
                  },
                },
                required: ["id", "title", "description", "priority"],
              },
              description:
                "Budget categories for education (OPTIONAL for budget_category_education)",
            },

            // Budget summary - required for component_type: "budget_summary"
            budgetSummary: {
              type: "object",
              properties: {
                monthlyIncome: {
                  type: "number",
                  description: "User's monthly income",
                },
                budgetCategories: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        description:
                          "Category identifier (e.g., 'pyf', 'essential_expenses', 'free_to_spend')",
                      },
                      title: {
                        type: "string",
                        description: "Display title for the budget category",
                      },
                      description: {
                        type: "string",
                        description:
                          "Description of what this budget category represents",
                      },
                      priority: {
                        type: "number",
                        description:
                          "Priority level for display order (lower numbers shown first)",
                      },
                      amount: {
                        type: "number",
                        description:
                          "Monetary value for this budget category (e.g., '6.900.000 VND')",
                      },
                    },
                    required: [
                      "id",
                      "title",
                      "description",
                      "priority",
                      "amount",
                    ],
                  },
                  description:
                    "Array of budget categories with their allocations and monetary values",
                },
              },
              required: ["monthlyIncome", "budgetCategories"],
              description:
                "Budget summary configuration (REQUIRED for budget_summary component)",
            },

            // Budget allocation tool - required for component_type: "budget_allocation_tool"
            monthlyIncome: {
              type: "number",
              description:
                "User's monthly income (REQUIRED for budget_allocation_tool)",
            },
            emergencyFundTarget: {
              type: "number",
              description:
                "Target emergency fund amount (REQUIRED for budget_allocation_tool)",
            },
            monthlyTargetSavings: {
              type: "number",
              description:
                "Monthly target savings amount (REQUIRED for budget_allocation_tool)",
            },
            budgetingStyle: {
              type: "string",
              enum: ["goal_focused", "detail_tracker"],
              description:
                "User's chosen budgeting style (REQUIRED for budget_allocation_tool) - determines if simplified or detailed budget records are created",
            },
            expenseBreakdown: {
              type: "object",
              description:
                "Detailed expense breakdown by category (REQUIRED for budget_allocation_tool when budgetingStyle is 'detail_tracker')",
            },

            // Free to spend choice - optional for component_type: "free_to_spend_choice"
            free_to_spend_choice: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    enum: ["goal_focused", "detail_tracker"],
                    description: "Free to spend choice",
                  },
                  title: {
                    type: "string",
                    description: "Free to spend choice title",
                  },
                  description: {
                    type: "string",
                    description: "Free to spend choice description",
                  },
                  features: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key features of this free to spend choice",
                  },
                  timeCommitment: {
                    type: "string",
                    description: "Time commitment required",
                  },
                },
                required: ["id", "title", "description"],
              },
              description:
                "Free to spend choice options for selection (OPTIONAL for free_to_spend_choice)",
            },
          },
        },
      },
      required: ["component_type", "title", "component_id", "context"],
      additionalProperties: false,
    },
  },
};

/**
 * Function definition for completing the onboarding process
 */
export const completeOnboardingTool = {
  type: "function" as const,
  function: {
    name: "complete_onboarding",
    description:
      "Finalizes the user onboarding process after all necessary information has been gathered and analyzed.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
};

/**
 * All onboarding function tools
 */
export const onboardingFunctionTools = [
  showOnboardingComponentTool,
  completeOnboardingTool,
];

/**
 * Get tools info for onboarding system prompt
 */
export function getOnboardingToolsInfo(): string {
  return onboardingFunctionTools
    .map((tool) => {
      const { name, description } = tool.function;
      return `- ${name}: ${description}`;
    })
    .join("\n");
}

/**
 * Validate component arguments
 */
export function validateComponentArguments(args: unknown): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!args || typeof args !== "object") {
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

  if (!argObj.context || typeof argObj.context !== "object") {
    errors.push("context object is required");
  }

  const context = argObj.context as Record<string, unknown>;

  // Validate component-specific requirements
  if (argObj.component_type === "multiple_choice" && context) {
    if (
      !context.options ||
      !Array.isArray(context.options) ||
      context.options.length < 2
    ) {
      errors.push(
        "multiple_choice requires options array with at least 2 options"
      );
    }
  }

  if (argObj.component_type === "financial_input" && context) {
    if (!context.inputType) {
      errors.push("financial_input requires inputType in context");
    }
  }

  if (argObj.component_type === "rating_scale" && context) {
    if (!context.scale) {
      errors.push("rating_scale requires scale configuration in context");
    }
  }

  if (argObj.component_type === "slider" && context) {
    if (!context.range || typeof context.range !== "object") {
      errors.push(
        "slider requires range configuration with min/max in context"
      );
    } else {
      const range = context.range as Record<string, unknown>;
      if (
        range.min === undefined ||
        range.min === null ||
        range.max === undefined ||
        range.max === null
      ) {
        errors.push(
          "slider requires range configuration with min/max in context"
        );
      }
    }
  }

  // New component validations
  if (argObj.component_type === "stage_selector" && context) {
    if (
      !context.stages ||
      !Array.isArray(context.stages) ||
      context.stages.length < 2
    ) {
      errors.push(
        "stage_selector requires stages array with at least 2 stages"
      );
    }
  }

  if (argObj.component_type === "expense_categories" && context) {
    if (
      !context.categories ||
      !Array.isArray(context.categories) ||
      context.categories.length < 1
    ) {
      errors.push(
        "expense_categories requires categories array with at least 1 category"
      );
    }
    // allowAdditional is now optional - component works fine without it
  }

  if (argObj.component_type === "goal_confirmation" && context) {
    if (!context.goalDetails || typeof context.goalDetails !== "object") {
      errors.push("goal_confirmation requires goalDetails object");
    } else {
      const goalDetails = context.goalDetails as Record<string, unknown>;
      if (
        !goalDetails.amount ||
        !goalDetails.timeframe ||
        !goalDetails.monthlyTarget
      ) {
        errors.push(
          "goal_confirmation requires goalDetails with amount, timeframe, and monthlyTarget"
        );
      }
    }
  }

  if (argObj.component_type === "education_content" && context) {
    if (
      !context.educationContent ||
      typeof context.educationContent !== "object"
    ) {
      errors.push("education_content requires educationContent object");
    } else {
      const eduContent = context.educationContent as Record<string, unknown>;
      if (!eduContent.type || !eduContent.title || !eduContent.content) {
        errors.push(
          "education_content requires educationContent with type, title, and content"
        );
      }
    }
  }

  if (argObj.component_type === "suggestions" && context) {
    if (
      !context.suggestions ||
      !Array.isArray(context.suggestions) ||
      context.suggestions.length < 1
    ) {
      errors.push(
        "suggestions requires suggestions array with at least 1 suggestion"
      );
    }
  }

  // Budget allocation enhancement component validations
  if (argObj.component_type === "budget_allocation_tool" && context) {
    if (!context.monthlyIncome || typeof context.monthlyIncome !== "number") {
      errors.push(
        "budget_allocation_tool requires monthlyIncome number in context"
      );
    }
    if (
      !context.emergencyFundTarget ||
      typeof context.emergencyFundTarget !== "number"
    ) {
      errors.push(
        "budget_allocation_tool requires emergencyFundTarget number in context"
      );
    }
    if (
      !context.monthlyTargetSavings ||
      typeof context.monthlyTargetSavings !== "number"
    ) {
      errors.push(
        "budget_allocation_tool requires monthlyTargetSavings number in context"
      );
    }
    if (
      !context.budgetingStyle ||
      typeof context.budgetingStyle !== "string" ||
      !["goal_focused", "detail_tracker"].includes(context.budgetingStyle)
    ) {
      errors.push(
        "budget_allocation_tool requires budgetingStyle ('goal_focused' or 'detail_tracker') in context"
      );
    }
    if (
      context.budgetingStyle === "detail_tracker" &&
      (!context.expenseBreakdown ||
        typeof context.expenseBreakdown !== "object")
    ) {
      errors.push(
        "budget_allocation_tool with budgetingStyle 'detail_tracker' requires expenseBreakdown object in context"
      );
    }
  }

  // Budget category education and philosophy selection don't have required context
  // Their context is optional for configuration but components work without it

  return { isValid: errors.length === 0, errors };
}
