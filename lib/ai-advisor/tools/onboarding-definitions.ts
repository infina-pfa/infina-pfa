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
            "introduction_template",
            // New stage-first components
            "stage_selector",
            "decision_tree",
            "expense_categories", 
            "savings_capacity",
            "goal_confirmation",
            "education_content"
          ],
          description: "Type of component to display - determines the UI component that will be rendered. REQUIRED: Must be one of the enum values."
        },
        title: {
          type: "string",
          description: "Clear, user-friendly title/question to display above the component. REQUIRED: Must be a meaningful question or instruction for the user."
        },
        component_id: {
          type: "string",
          description: "Unique identifier for this component instance. REQUIRED: Use format 'component_type_timestamp' (e.g. 'stage_selector_1751563582612')"
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
            },

            // NEW STAGE-FIRST COMPONENTS

            // Stage selector - required for component_type: "stage_selector"
            stages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", description: "Financial stage identifier (debt, start_saving, start_investing)" },
                  title: { type: "string", description: "Display title for the stage" },
                  description: { type: "string", description: "Brief description of the stage" },
                  criteria: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of criteria that define this stage"
                  }
                },
                required: ["id", "title", "description", "criteria"]
              },
              description: "Array of financial stages to choose from (REQUIRED for stage_selector)"
            },

            // Decision tree - required for component_type: "decision_tree"
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", description: "Question identifier (e.g. high_interest_debt, emergency_fund)" },
                  question: { type: "string", description: "The question text to display" },
                  explanation: { type: "string", description: "Optional explanation or clarification" },
                  yesLabel: { type: "string", description: "Custom label for Yes button (optional)" },
                  noLabel: { type: "string", description: "Custom label for No button (optional)" }
                },
                required: ["id", "question"]
              },
              description: "Array of decision tree questions to ask (REQUIRED for decision_tree)"
            },

            // Expense categories - required for component_type: "expense_categories"
            categories: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", description: "Category identifier" },
                  name: { type: "string", description: "Category display name" },
                  placeholder: { type: "string", description: "Placeholder text for input" },
                  required: { type: "boolean", description: "Whether this category is required" }
                },
                required: ["id", "name", "placeholder", "required"]
              },
              description: "Array of expense categories to collect (REQUIRED for expense_categories)"
            },
            allowAdditional: {
              type: "boolean",
              description: "Whether user can add additional expense categories (REQUIRED for expense_categories)"
            },

            // Savings capacity - optional for component_type: "savings_capacity"
            incomeHint: {
              type: "string",
              description: "Hint text about income assessment"
            },
            savingsHint: {
              type: "string", 
              description: "Hint text about savings capacity"
            },

            // Goal confirmation - required for component_type: "goal_confirmation"
            goalDetails: {
              type: "object",
              properties: {
                amount: { type: "number", description: "Target emergency fund amount" },
                timeframe: { type: "number", description: "Timeline to achieve goal in months" },
                monthlyTarget: { type: "number", description: "Required monthly savings amount" }
              },
              required: ["amount", "timeframe", "monthlyTarget"],
              description: "Goal details for confirmation (REQUIRED for goal_confirmation)"
            },

            // Education content - required for component_type: "education_content"  
            educationContent: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["video", "text"], description: "Type of educational content" },
                title: { type: "string", description: "Title of the educational content" },
                content: { type: "string", description: "Main educational content text" },
                videoUrl: { type: "string", description: "URL for video content (if type is video)" },
                relatedActions: {
                  type: "array",
                  items: { type: "string" },
                  description: "Related action buttons for user interaction"
                }
              },
              required: ["type", "title", "content"],
              description: "Educational content structure (REQUIRED for education_content)"
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
- **Stage Selector Example**:
  \`\`\`json
  {
    "component_type": "stage_selector",
    "title": "Để tôi có thể tư vấn tốt nhất, hãy chọn tình huống tài chính hiện tại của bạn:",
    "component_id": "stage_selector_${timestamp}",
    "context": {
      "stages": [
        {
          "id": "debt",
          "title": "Tôi đang có nợ cần giải quyết",
          "description": "Bạn có các khoản nợ thẻ tín dụng, nợ tiêu dùng hoặc các khoản vay ngắn hạn đang ảnh hưởng đến tài chính",
          "criteria": ["Nợ thẻ tín dụng hoặc nợ tiêu dùng", "Lãi suất cao (>15%/năm)", "Ảnh hưởng đến chi tiêu hàng tháng"]
        },
        {
          "id": "start_saving",
          "title": "Tôi muốn bắt đầu tiết kiệm",
          "description": "Bạn không có nợ đáng kể nhưng chưa có quỹ dự phòng, muốn xây dựng nền tảng tài chính vững chắc",
          "criteria": ["Không có nợ xấu", "Chưa có quỹ dự phòng", "Muốn xây dựng thói quen tiết kiệm"]
        },
        {
          "id": "start_investing", 
          "title": "Tôi sẵn sàng đầu tư",
          "description": "Bạn đã có quỹ dự phòng và muốn bắt đầu đầu tư để tăng trưởng tài sản dài hạn",
          "criteria": ["Đã có quỹ dự phòng 3-6 tháng", "Thu nhập ổn định", "Muốn tăng trưởng tài sản"]
        }
      ]
    }
  }
  \`\`\`

- **Expense Categories Example**:
  \`\`\`json
  {
    "component_type": "expense_categories",
    "title": "Để tính toán quỹ dự phòng phù hợp, hãy cho tôi biết chi tiêu hàng tháng của bạn:",
    "component_id": "expense_categories_${timestamp}",
    "context": {
      "categories": [
        {
          "id": "housing",
          "name": "Nhà ở (thuê nhà/điện/nước)",
          "placeholder": "Ví dụ: 8,000,000 VND",
          "required": true
        },
        {
          "id": "food",
          "name": "Ăn uống",
          "placeholder": "Ví dụ: 4,000,000 VND",
          "required": true
        },
        {
          "id": "transportation",
          "name": "Di chuyển",
          "placeholder": "Ví dụ: 2,000,000 VND",
          "required": true
        },
        {
          "id": "other",
          "name": "Chi tiêu khác (giải trí, mua sắm, v.v.)",
          "placeholder": "Ví dụ: 3,000,000 VND",
          "required": true
        }
      ],
      "allowAdditional": true
    }
  }
  \`\`\`

- **Savings Capacity Example**:
  \`\`\`json
  {
    "component_type": "savings_capacity",
    "title": "Bạn có thể tiết kiệm bao nhiều mỗi tháng?",
    "component_id": "savings_capacity_${timestamp}",
    "context": {
      "incomeHint": "Bạn không cần chia sẻ thu nhập chính xác, chỉ cần ước tính khả năng tiết kiệm",
      "savingsHint": "Hãy thật thà về số tiền bạn có thể tiết kiệm một cách bền vững mỗi tháng"
    }
  }
  \`\`\`

- **Goal Confirmation Example**:
  \`\`\`json
  {
    "component_type": "goal_confirmation",
    "title": "Đây là mục tiêu quỹ dự phòng dành cho bạn:",
    "component_id": "goal_confirmation_${timestamp}",
    "context": {
      "goalDetails": {
        "amount": 51000000,
        "timeframe": 6,
        "monthlyTarget": 8500000
      }
    }
  }
  \`\`\`

- **Education Content Example**:
  \`\`\`json
  {
    "component_type": "education_content",
    "title": "Tại sao nên xây dựng quỹ dự phòng sớm?",
    "component_id": "education_content_${timestamp}",
    "context": {
      "educationContent": {
        "type": "video",
        "title": "Quỹ dự phòng - Nền tảng của sự tự do tài chính",
        "content": "Quỹ dự phòng là khoản tiền dành riêng để đối phó với các tình huống khẩn cấp như mất việc, ốm đau, hoặc các chi phí bất ngờ. Đây là bước đầu tiên và quan trọng nhất trong hành trình tài chính của bạn...",
        "videoUrl": "https://youtube.com/watch?v=emergency-fund-basics",
        "relatedActions": ["Tôi nên bắt đầu như thế nào?", "Làm sao để duy trì động lực?"]
      }
    }
  }
  \`\`\`

- **Financial Input Example**:
  \`\`\`json
  {
    "component_type": "financial_input",
    "title": "Thu nhập hàng tháng của bạn là bao nhiều?",
    "component_id": "financial_input_${timestamp}",
    "context": {
      "inputType": "income",
      "placeholder": "Ví dụ: 25,000,000 VND",
      "currency": "VND"
    }
  }
  \`\`\`

- **Multiple Choice Example**:
  \`\`\`json
  {
    "component_type": "multiple_choice",
    "title": "Mục tiêu tài chính chính của bạn là gì?",
    "component_id": "multiple_choice_${timestamp}",
    "context": {
      "options": [
        {"id": "emergency_fund", "label": "Xây dựng quỹ dự phòng", "value": "emergency_fund"},
        {"id": "pay_debt", "label": "Trả hết nợ", "value": "pay_debt"},
        {"id": "save_house", "label": "Tiết kiệm mua nhà", "value": "save_house"},
        {"id": "invest_retirement", "label": "Đầu tư cho tương lai", "value": "invest_retirement"}
      ]
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

  // New component validations
  if (argObj.component_type === 'stage_selector' && context) {
    if (!context.stages || !Array.isArray(context.stages) || context.stages.length < 2) {
      errors.push("stage_selector requires stages array with at least 2 stages");
    }
  }

  if (argObj.component_type === 'expense_categories' && context) {
    if (!context.categories || !Array.isArray(context.categories) || context.categories.length < 1) {
      errors.push("expense_categories requires categories array with at least 1 category");
    }
    if (context.allowAdditional === undefined) {
      errors.push("expense_categories requires allowAdditional boolean flag");
    }
  }

  if (argObj.component_type === 'goal_confirmation' && context) {
    if (!context.goalDetails || typeof context.goalDetails !== 'object') {
      errors.push("goal_confirmation requires goalDetails object");
    } else {
      const goalDetails = context.goalDetails as Record<string, unknown>;
      if (!goalDetails.amount || !goalDetails.timeframe || !goalDetails.monthlyTarget) {
        errors.push("goal_confirmation requires goalDetails with amount, timeframe, and monthlyTarget");
      }
    }
  }

  if (argObj.component_type === 'education_content' && context) {
    if (!context.educationContent || typeof context.educationContent !== 'object') {
      errors.push("education_content requires educationContent object");
    } else {
      const eduContent = context.educationContent as Record<string, unknown>;
      if (!eduContent.type || !eduContent.title || !eduContent.content) {
        errors.push("education_content requires educationContent with type, title, and content");
      }
    }
  }
  
  return { isValid: errors.length === 0, errors };
} 