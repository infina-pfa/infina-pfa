export interface OnboardingState {
  step: OnboardingStep;
  userProfile: UserProfile;
  chatMessages: OnboardingMessage[];
  currentQuestion: string | null;
  isComplete: boolean;
  conversationId: string | null;
  userId: string;
  // New fields for stage-based flow
  financialStage?: FinancialStage;
  stageFlow?: StageFlow;
  currentStageStep?: number;
}

export type OnboardingStep =
  | "ai_welcome"
  | "stage_identification"
  | "stage_introduction"
  | "stage_flow"
  | "complete";

export interface UserProfile {
  name?: string;
  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  location?: string;
  // Financial information
  income?: number;
  expenses?: number;
  currentDebts?: number;
  savings?: number;
  // New expense breakdown for saving flow
  expenseBreakdown?: {
    housing?: number;
    food?: number;
    transport?: number;
    other?: number;
  };
  // Savings goals and capacity
  monthlySavingsCapacity?: number;
  emergencyFundGoal?: number;
  timelineToGoal?: number; // months
  // Stage information
  identifiedStage?: FinancialStage;
  stageConfirmed?: boolean;
  // Investment and risk information
  investmentExperience?: "none" | "beginner" | "intermediate" | "advanced";
  primaryFinancialGoal?: string;
  timeHorizon?: "short" | "medium" | "long";
  riskTolerance?: "conservative" | "moderate" | "aggressive";
}

export interface QualitativeAssessment {
  financialKnowledge: number; // 1-5 scale
  riskComfort: number; // 1-5 scale
  planningHorizon: "short" | "medium" | "long";
  primaryMotivation: string;
  biggestConcern: string;
  preferredLearningStyle: "visual" | "reading" | "hands_on" | "interactive";
}

// New financial stages based on user requirements
export type FinancialStage = "debt" | "start_saving" | "start_investing";

// Stage-specific flows
export type StageFlow =
  | "debt_elimination"
  | "saving_emergency_fund"
  | "investment_start";

// New type for tracking specific stage step progression
export type SavingFlowStep =
  | 0 // Initial/stage selection
  | 1 // Emergency fund explanation and acceptance
  | 2 // Expense categories collection
  | 3 // Savings capacity determination
  | 4 // Goal confirmation
  | 5; // HYSA guidance and completion

// New components for the updated flow
export type ComponentType =
  | "multiple_choice"
  | "rating_scale"
  | "slider"
  | "text_input"
  | "financial_input"
  | "goal_selector"
  | "introduction_template"
  // New stage-specific components
  | "stage_selector"
  | "decision_tree"
  | "expense_categories"
  | "savings_capacity"
  | "goal_confirmation"
  | "education_content"
  | "suggestions";

export interface OnboardingMessage {
  id: string;
  type: "ai" | "user" | "component";
  content: string;
  timestamp: Date;
  component?: OnboardingComponent;
  metadata?: Record<string, unknown>;
  isError?: boolean;
}

export interface OnboardingComponent {
  id: string;
  type: OnboardingComponentType;
  title: string;
  context: ComponentData;
  isCompleted: boolean;
  response?: ComponentResponse;
}

export type OnboardingComponentType =
  | "multiple_choice"
  | "rating_scale"
  | "slider"
  | "text_input"
  | "financial_input"
  | "goal_selector"
  | "introduction_template"
  // New stage-specific components
  | "stage_selector"
  | "decision_tree"
  | "expense_categories"
  | "savings_capacity"
  | "goal_confirmation"
  | "education_content"
  | "suggestions";

export interface ComponentData {
  // Multiple choice
  options?: Array<{
    id: string;
    label: string;
    value: string;
    description?: string;
  }>;

  // Rating scale
  scale?: {
    min: number;
    max: number;
    labels: string[];
  };

  // Slider
  range?: {
    min: number;
    max: number;
    step: number;
    unit?: string;
  };

  // Text input
  placeholder?: string;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
  };

  // Financial input
  currency?: string;
  inputType?: "income" | "expense" | "debt" | "savings";

  // Introduction template
  template?: string;
  suggestions?: Array<{
    id: string;
    label: string;
    value: string;
  }>;

  // Stage selector
  stages?: Array<{
    id: FinancialStage;
    title: string;
    description: string;
    criteria: string[];
  }>;

  // Decision tree
  questions?: Array<{
    id: string;
    question: string;
    explanation?: string;
    yesLabel?: string;
    noLabel?: string;
  }>;

  // Expense categories
  categories?: Array<{
    id: string;
    name: string;
    placeholder: string;
    required: boolean;
  }>;
  allowAdditional?: boolean;

  // Savings capacity
  incomeHint?: string;
  savingsHint?: string;

  // Goal confirmation
  goalDetails?: {
    amount: number;
    timeframe: number;
    monthlyTarget: number;
  };

  // Education content
  educationContent?: EducationContent;
}

// New education content structure
export interface EducationContent {
  type: "video" | "text";
  title: string;
  content: string;
  videoUrl?: string;
  relatedActions?: string[];
}

export interface ComponentResponse {
  selectedOption?: string;
  rating?: number;
  sliderValue?: number;
  sliderUnit?: string; // Add unit for slider responses
  textValue?: string;
  financialValue?: number;
  // New response types for stage-specific components
  selectedStage?: FinancialStage;
  // Decision tree
  answers?: Record<string, boolean>;
  determinedStage?: string;
  reasoning?: string;
  expenseBreakdown?: {
    housing?: number;
    food?: number;
    transport?: number;
    other?: number;
  };
  savingsCapacity?: number;
  goalConfirmed?: boolean;
  // Goal confirmation details
  goalDetails?: {
    amount: number;
    timeframe: number;
    monthlyTarget: number;
    type?: string;
  };
  userAction?: "confirmed" | "requested_adjustment" | "cancelled";
  userMessage?: string;
  nextSteps?: string;
  actionContext?: {
    goalType?: string;
    amount?: number;
    monthlyTarget?: number;
    timeframe?: number;
    readyToStart?: boolean;
    currentAmount?: number;
    currentMonthlyTarget?: number;
    currentTimeframe?: number;
    needsAdjustment?: boolean;
    adjustmentRequested?: boolean;
    goalId?: string; // ID of the created/updated goal
    goalCreationError?: string; // Error message if goal creation fails
  };
  adjustmentReason?: string;
  educationCompleted?: boolean;
  completedAt: Date;
}

// AI Function calling types
export interface OnboardingAction {
  type: OnboardingActionType;
  payload: OnboardingActionPayload;
}

export type OnboardingActionType =
  | "show_component"
  | "update_profile"
  | "analyze_stage"
  | "complete_onboarding";

export interface OnboardingActionPayload {
  componentId?: string;
  componentType?: OnboardingComponentType;
  title?: string;
  data?: ComponentData;
  profileUpdates?: Partial<UserProfile>;
  analysisResults?: {
    detectedStage: FinancialStage;
    confidence: number;
    reasoning: string;
  };
}

// Service interfaces
export interface OnboardingService {
  initializeOnboarding(userId: string): Promise<OnboardingState>;
  saveUserResponse(
    componentId: string,
    response: ComponentResponse
  ): Promise<void>;
  updateUserProfile(updates: Partial<UserProfile>): Promise<void>;
  completeOnboarding(finalProfile: UserProfile): Promise<void>;

  // Chat history methods
  saveChatMessage(
    conversationId: string,
    sender: "user" | "ai" | "system",
    content: string,
    componentId?: string,
    metadata?: Record<string, unknown>,
    customTimestamp?: string
  ): Promise<unknown>;
  saveChatMessageAsync(
    conversationId: string,
    sender: "user" | "ai" | "system",
    content: string,
    componentId?: string,
    metadata?: Record<string, unknown>,
    customTimestamp?: string
  ): Promise<void>;
  getChatQueueStatus(): Promise<{
    queueSize: number;
    isProcessing: boolean;
    failedMessages: number;
  }>;
  flushChatQueue(): Promise<void>;
  loadChatHistory(
    conversationId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    messages: unknown[];
    total: number;
  }>;
  hasExistingChatHistory(conversationId: string): Promise<boolean>;
}

// Hook return types
export interface UseOnboardingChatReturn {
  // State
  state: OnboardingState;
  isLoading: boolean;
  error: string | null;

  // Actions
  sendMessage: (message: string) => Promise<void>;
  handleComponentResponse: (
    componentId: string,
    response: ComponentResponse
  ) => Promise<void>;

  // Chat specific
  messages: OnboardingMessage[];
  isAIThinking: boolean;
  isStreaming: boolean;
}
