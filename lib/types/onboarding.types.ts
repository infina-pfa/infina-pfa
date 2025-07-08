export interface OnboardingState {
  step: OnboardingStep;
  userProfile: UserProfile;
  chatMessages: OnboardingMessage[];
  currentQuestion: string | null;
  isComplete: boolean;
  conversationId: string | null;
  userId: string;
}

export type OnboardingStep = 
  | "ai_welcome"
  | "user_introduction" 
  | "financial_assessment"
  | "risk_assessment"
  | "goal_setting"
  | "stage_analysis"
  | "complete";

export interface UserProfile {
  // Basic demographics
  name: string;
  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  location?: string;
  
  // Financial situation
  income?: number;
  expenses?: number;
  currentDebts?: number;
  savings?: number;
  investmentExperience?: "none" | "beginner" | "intermediate" | "advanced";
  
  // Goals and preferences
  primaryFinancialGoal?: string;
  timeHorizon?: "short" | "medium" | "long";
  riskTolerance?: "conservative" | "moderate" | "aggressive";
  
  // Assessment results
  financialStage?: FinancialStage;
  qualitativeData?: QualitativeAssessment;
}

export interface QualitativeAssessment {
  financialKnowledge: number; // 1-5 scale
  riskComfort: number; // 1-5 scale  
  planningHorizon: "short" | "medium" | "long";
  primaryMotivation: string;
  biggestConcern: string;
  preferredLearningStyle: "visual" | "reading" | "hands_on" | "interactive";
}

export type FinancialStage = 
  | "survival"      // Stage 0: Stop bleeding cash
  | "debt"          // Stage 1: Eliminate bad debt
  | "foundation"    // Stage 2: Build emergency fund
  | "investing"     // Stage 3: Start investing
  | "optimizing"    // Stage 4: Optimize assets
  | "protecting"    // Stage 5: Protect assets
  | "retirement";   // Stage 6: Retirement planning

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
  | "introduction_template";

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
  suggestions?: string[];
}

export interface ComponentResponse {
  selectedOption?: string;
  rating?: number;
  sliderValue?: number;
  textValue?: string;
  financialValue?: number;
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
  saveUserResponse(componentId: string, response: ComponentResponse): Promise<void>;
  updateUserProfile(updates: Partial<UserProfile>): Promise<void>;
  analyzeFinancialStage(profile: UserProfile): Promise<{
    stage: FinancialStage;
    confidence: number;
    reasoning: string;
  }>;
  completeOnboarding(finalProfile: UserProfile): Promise<void>;
  
  // Chat history methods
  saveChatMessage(
    conversationId: string,
    sender: 'user' | 'ai' | 'system',
    content: string,
    componentId?: string,
    metadata?: Record<string, unknown>,
    customTimestamp?: string
  ): Promise<unknown>;
  saveChatMessageAsync(
    conversationId: string,
    sender: 'user' | 'ai' | 'system',
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
  handleComponentResponse: (componentId: string, response: ComponentResponse) => Promise<void>;
  
  // Chat specific
  messages: OnboardingMessage[];
  isAIThinking: boolean;
  isStreaming: boolean;
} 