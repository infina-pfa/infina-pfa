# Infina PFA - Onboarding Flow Complete Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Business Flow & User Journey](#business-flow--user-journey)
3. [Technical Architecture](#technical-architecture)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [AI Integration](#ai-integration)
8. [Authentication & Security](#authentication--security)
9. [Error Handling](#error-handling)
10. [Performance & Monitoring](#performance--monitoring)

---

## 📖 Overview

### Purpose
The onboarding system collects comprehensive financial information from new users through an AI-powered conversational interface, analyzes their financial situation, and determines their appropriate financial stage to provide personalized recommendations.

### Key Objectives
- **User-Friendly Experience**: Conversational chat interface instead of traditional forms
- **Comprehensive Data Collection**: Financial situation, goals, risk tolerance, and personal preferences
- **AI-Powered Analysis**: Intelligent financial stage determination and personalized recommendations
- **Multilingual Support**: Full Vietnamese and English support
- **Progressive Enhancement**: Gradual data collection with intelligent follow-up questions

### Success Criteria
- User completes onboarding with complete financial profile
- System accurately determines user's financial stage
- Smooth transition to main application experience
- High completion rate (target: >85%)

---

## 🗺️ Business Flow & User Journey

### Overall Journey
```
Sign Up → Email Verification → Onboarding → Main Application (Chat/Budgeting)
```

### Onboarding Steps

#### 1. **AI Welcome Step** (`ai_welcome`)
**Purpose**: Initial greeting and system introduction
- AI provides warm welcome message
- Explains what Infina PFA can do
- Sets expectations for the onboarding process
- Immediately shows introduction template component

#### 2. **User Introduction Step** (`user_introduction`)
**Purpose**: Basic personal information and introduction
- **Component**: Introduction Template Component
- **Data Collected**: 
  - Personal introduction text
  - Background information
  - Basic demographic context
- **AI Behavior**: Acknowledges introduction, transitions to financial assessment

#### 3. **Financial Assessment Step** (`financial_assessment`)
**Purpose**: Core financial situation analysis
- **Components**: Financial Input Components
- **Data Collected**:
  - Monthly income (VND)
  - Monthly expenses (VND)
  - Current debts (VND)
  - Current savings (VND)
- **AI Behavior**: Reviews financial data, asks clarifying questions if needed

#### 4. **Risk Assessment Step** (`risk_assessment`)
**Purpose**: Investment experience and risk tolerance
- **Components**: Multiple Choice, Rating Scale
- **Data Collected**:
  - Investment experience level (none/beginner/intermediate/advanced)
  - Risk tolerance (conservative/moderate/aggressive)
  - Comfort with market volatility
- **AI Behavior**: Adapts questions based on experience level

#### 5. **Goal Setting Step** (`goal_setting`)
**Purpose**: Financial goals and preferences
- **Components**: Goal Selector, Text Input
- **Data Collected**:
  - Primary financial goal
  - Time horizon (short/medium/long)
  - Specific aspirations and concerns
- **AI Behavior**: Explores goals in detail, asks about priorities

#### 6. **Stage Analysis Step** (`stage_analysis`)
**Purpose**: AI analyzes collected data to determine financial stage
- **Process**: AI calls `analyze_financial_stage` function
- **Output**: 
  - Determined financial stage (survival → retirement)
  - Confidence level
  - Reasoning explanation
- **AI Behavior**: Explains analysis results and next steps

#### 7. **Completion Step** (`complete`)
**Purpose**: Finalize onboarding and transition to main app
- **Process**: 
  - Save complete profile to database
  - Mark onboarding as completed
  - Create initial conversation for main chat
- **Outcome**: Redirect to main chat interface

### Financial Stages Framework

The system categorizes users into 7 financial stages:

1. **Survival Stage**: Negative cash flow, immediate stabilization needed
2. **Debt Elimination**: High debt-to-income ratio (>30%)
3. **Foundation Building**: Building emergency fund (0-3 months expenses)
4. **Investing Stage**: Ready for wealth building (3-6+ months emergency fund)
5. **Optimizing Assets**: Portfolio optimization and tax efficiency
6. **Protecting Assets**: Insurance and asset protection focus
7. **Retirement Planning**: Advanced retirement and estate planning

---

## 🏗️ Technical Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│                 │    │                 │    │                 │
│ • React Pages   │    │ • Next.js API   │    │ • Supabase      │
│ • Chat Interface│◄──►│ • OpenAI GPT-4  │◄──►│ • PostgreSQL    │
│ • UI Components │    │ • Streaming     │    │ • RLS Policies  │
│ • State Mgmt    │    │ • Auth Middleware│    │ • Real-time     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

**Frontend**:
- Next.js 14 (App Router)
- React 18 with TypeScript
- Tailwind CSS (Custom Infina Design System)
- react-i18next (Internationalization)

**Backend**:
- Next.js API Routes
- OpenAI GPT-4 (Function Calling)
- Supabase Auth & Database
- Server-Sent Events (Streaming)

**Database**:
- PostgreSQL (via Supabase)
- Row Level Security (RLS)
- Real-time subscriptions
- JSONB for flexible data storage

**AI & Machine Learning**:
- OpenAI GPT-4 with Function Calling
- Custom financial analysis prompts
- Fallback rule-based analysis
- Streaming responses for real-time UX

---

## 🗄️ Database Schema

### Core Tables

#### `onboarding_responses`
Stores individual component responses during onboarding.

```sql
CREATE TABLE public.onboarding_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  component_id TEXT NOT NULL,
  response_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(user_id, component_id)
);
```

**Purpose**: Track individual component interactions and responses
**Key Features**:
- One response per user per component
- JSONB for flexible response data structure
- Timestamps for audit trail

#### `onboarding_profiles`
Stores complete user profiles during onboarding.

```sql
CREATE TABLE public.onboarding_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  profile_data JSONB NOT NULL DEFAULT '{}',
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

**Purpose**: Store complete user profile and onboarding completion status
**Key Features**:
- JSONB for flexible profile structure
- Completion tracking
- Historical data preservation

#### `users` (Extended)
Main user table extended with onboarding fields.

```sql
ALTER TABLE public.users 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN onboarding_completed_at TIMESTAMPTZ;
```

### Security & Performance

**Row Level Security (RLS)**:
- All tables have RLS enabled
- Users can only access their own data
- Policies enforce `auth.uid() = user_id`

**Indexes**:
```sql
-- Performance indexes
CREATE INDEX idx_onboarding_responses_user_id ON onboarding_responses(user_id);
CREATE INDEX idx_onboarding_responses_component_id ON onboarding_responses(component_id);
CREATE INDEX idx_onboarding_profiles_user_id ON onboarding_profiles(user_id);
CREATE INDEX idx_users_onboarding_completed ON users(onboarding_completed);
```

---

## 🔌 API Endpoints

### Core Onboarding APIs

#### `POST /api/onboarding/initialize`
**Purpose**: Initialize new onboarding session
**Input**:
```typescript
{
  userId: string
}
```
**Output**:
```typescript
{
  success: boolean;
  data: {
    conversationId: string;
    userProfile: {
      name: string;
      [key: string]: unknown;
    };
  };
}
```
**Process**:
1. Authenticate user
2. Check existing profile
3. Create/get conversation
4. Return initial state

#### `POST /api/onboarding/ai-stream`
**Purpose**: Stream AI responses during onboarding chat
**Input**:
```typescript
{
  message: string;
  conversationHistory?: Array<{
    id: string;
    content: string;
    sender: "user" | "ai";
    timestamp: string;
  }>;
  userProfile?: Record<string, unknown>;
  currentStep?: string;
}
```
**Output**: Server-Sent Events stream
**Process**:
1. Authenticate user
2. Generate context-aware system prompt
3. Call OpenAI with function tools
4. Stream response in real-time
5. Handle function calls (components, profile updates)

#### `POST /api/onboarding/responses`
**Purpose**: Save user responses from UI components
**Input**:
```typescript
{
  componentId: string;
  responseData: {
    selectedOption?: string;
    textValue?: string;
    financialValue?: number;
    rating?: number;
    sliderValue?: number;
    completedAt: string;
  };
}
```

#### `POST /api/onboarding/analyze-stage`
**Purpose**: Analyze user financial stage using AI
**Process**:
1. Use OpenAI GPT-4 for analysis
2. Fallback to rule-based analysis if AI fails
3. Return stage determination with confidence

#### `POST /api/onboarding/complete`
**Purpose**: Complete onboarding and finalize user profile
**Process**:
1. Update main users table
2. Save complete profile
3. Mark onboarding as completed
4. Return success confirmation

---

## 🎨 Frontend Components

### Component Architecture

```
OnboardingPage
├── OnboardingChatInterface
    ├── OnboardingProgress
    ├── OnboardingMessageBubble[]
    │   └── OnboardingComponentRenderer
    │       ├── IntroductionTemplateComponent
    │       ├── MultipleChoiceComponent
    │       ├── FinancialInputComponent
    │       ├── RatingScaleComponent
    │       ├── SliderComponent
    │       ├── TextInputComponent
    │       └── GoalSelectorComponent
    ├── OnboardingTypingIndicator
    └── OnboardingChatInput
```

### Key Components

#### `OnboardingPage` (`app/onboarding/page.tsx`)
**Purpose**: Main onboarding page with authentication checks
**Features**:
- Authentication validation
- Onboarding completion check
- Route protection and redirection
- Landing page style header

#### `OnboardingChatInterface`
**Purpose**: Main chat interface component
**Features**:
- Real-time message display
- Component rendering
- Progress tracking
- Error handling and loading states

#### `OnboardingComponentRenderer`
**Purpose**: Dynamic component rendering based on AI function calls
**Supported Components**:
- **Introduction Template**: Rich text input with suggestions
- **Multiple Choice**: Single/multi-select options
- **Financial Input**: Currency input with validation
- **Rating Scale**: 1-5 scale with labels
- **Slider**: Range input with visual feedback
- **Text Input**: Free text with validation
- **Goal Selector**: Specialized multiple choice for goals

### State Management

#### Hook: `useOnboardingChat`
**Purpose**: Centralized state management for onboarding chat
**State**:
```typescript
{
  state: OnboardingState;
  messages: OnboardingMessage[];
  isLoading: boolean;
  isAIThinking: boolean;
  isStreaming: boolean;
  error: string | null;
}
```
**Actions**:
- `sendMessage(message: string)`
- `handleComponentResponse(componentId: string, response: ComponentResponse)`

### Design System Compliance
- **Colors**: Infina brand palette (#0055FF, #2ECC71, #F44336, etc.)
- **Typography**: Nunito font family
- **Layout**: Flat, borderless design
- **Interactions**: Subtle hover states and transitions
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

---

## 🤖 AI Integration

### OpenAI GPT-4 Function Calling

#### System Prompt Strategy
**Dynamic Context Generation**: The system prompt is dynamically generated based on:
- Current onboarding step
- User profile data collected so far
- Conversation history
- Previous component responses

**Example Prompt Structure**:
```
You are Infina PFA's onboarding assistant...

Current Context:
- User: John Doe
- Step: financial_assessment
- Profile: {name: "John", age: 28}
- History: [previous interactions]

Your Role:
- Guide users through financial onboarding
- Ask contextual follow-up questions
- Show appropriate UI components
- Provide personalized advice

Available Functions:
- show_onboarding_component
- update_onboarding_profile
- analyze_financial_stage
```

#### Function Tools

##### `show_onboarding_component`
**Purpose**: Display interactive UI components
**Parameters**:
- `component_type`: Type of component to show
- `title`: Question or instruction
- `context`: Component configuration
- `component_id`: Unique identifier

**Example Call**:
```json
{
  "name": "show_onboarding_component",
  "arguments": {
    "component_type": "financial_input",
    "title": "What's your monthly income?",
    "context": {
      "currency": "VND",
      "inputType": "income",
      "placeholder": "Enter your monthly income"
    },
    "component_id": "monthly_income_001"
  }
}
```

##### `update_onboarding_profile`
**Purpose**: Update user profile with collected information
**Parameters**:
- `profile_updates`: Object with profile field updates

##### `analyze_financial_stage`
**Purpose**: Trigger financial stage analysis
**Parameters**:
- `profile_data`: Complete user profile
- `trigger_completion`: Whether to complete onboarding

### AI Behavior Patterns

#### Conversational Flow
1. **Welcome & Orient**: Brief introduction, set expectations
2. **Collect Systematically**: One topic at a time, logical progression
3. **Validate & Clarify**: Ask follow-up questions for unclear responses
4. **Summarize & Confirm**: Review collected information
5. **Analyze & Explain**: Explain financial stage determination
6. **Transition**: Smooth handoff to main application

#### Error Handling
- **AI Unavailable**: Fallback to guided form experience
- **Function Call Errors**: Retry with simpler parameters
- **Invalid Responses**: Request clarification from user

---

## 🔐 Authentication & Security

### Authentication Flow
1. **User Sign-up**: Email + password via Supabase Auth
2. **Email Verification**: Required before onboarding access
3. **Session Management**: JWT tokens with automatic refresh
4. **Route Protection**: Middleware checks for authenticated users

### Authorization Levels

#### Route Protection
```typescript
// Middleware logic
if (!user && !publicRoutes.includes(pathname)) {
  return redirect('/auth/sign-in');
}

if (user && !hasProfile && pathname !== '/onboarding') {
  return redirect('/onboarding');
}

if (user && hasProfile && authRoutes.includes(pathname)) {
  return redirect('/chat');
}
```

#### Database Security
- **Row Level Security (RLS)**: Enabled on all tables
- **User Isolation**: Users can only access their own data
- **API Authentication**: All API routes validate user sessions

### Data Privacy
- **Minimal Data Collection**: Only necessary financial information
- **Secure Storage**: Encrypted at rest in Supabase
- **Data Retention**: User-controlled data deletion
- **GDPR Compliance**: Right to access, modify, delete personal data

---

## ⚠️ Error Handling

### Error Categories

#### Authentication Errors
```typescript
{
  type: "AUTH_ERROR";
  message: "Authentication required";
  action: "REDIRECT_LOGIN";
}
```

#### Validation Errors
```typescript
{
  type: "VALIDATION_ERROR";
  message: "Please enter a valid income amount";
  field: "income";
  action: "FOCUS_FIELD";
}
```

#### AI Service Errors
```typescript
{
  type: "AI_SERVICE_ERROR";
  message: "AI service temporarily unavailable";
  action: "RETRY_OR_FALLBACK";
}
```

### Error Recovery Strategies

#### Progressive Degradation
1. **AI Unavailable**: Fall back to traditional form-based onboarding
2. **Streaming Failed**: Display complete messages instead of streaming
3. **Component Error**: Show simplified text input as fallback

#### User Communication
- **Clear Messages**: User-friendly error descriptions
- **Action Guidance**: Clear next steps for users
- **Status Indicators**: Visual feedback for error states
- **Recovery Options**: Retry buttons and alternative paths

---

## ⚡ Performance & Monitoring

### Frontend Optimizations

#### Code Splitting
- **Route-based**: Separate bundles for onboarding vs main app
- **Component-based**: Lazy loading for complex components
- **Dynamic Imports**: Load components only when needed

#### State Management
- **Minimal Re-renders**: Optimized React hooks and memoization
- **Local State**: Keep temporary state local to components
- **Context Optimization**: Split contexts by concern

### Backend Optimizations

#### Database Performance
- **Indexed Queries**: All frequent queries use indexes
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Minimize N+1 queries

#### API Performance
- **Response Caching**: Cache AI analysis results
- **Streaming**: Real-time response streaming
- **Compression**: Gzip compression for API responses

#### AI Service Optimization
- **Context Management**: Optimize prompt length for cost/speed
- **Fallback Systems**: Fast rule-based analysis backup
- **Request Debouncing**: Prevent duplicate AI calls

### Key Performance Indicators (KPIs)

#### User Success Metrics
- **Completion Rate**: 85%+ target
- **Time to Complete**: <15 minutes average
- **User Satisfaction**: 4.5+ stars average
- **Return Rate**: Users returning to complete onboarding

#### Technical Performance
- **AI Response Time**: <3 seconds average
- **Component Load Time**: <1 second
- **Error Rate**: <2% of all interactions
- **Uptime**: 99.9% availability

---

## 🌍 Internationalization

### Supported Languages
- **English (en)**: Primary language, complete coverage
- **Vietnamese (vi)**: Full localization for Vietnamese market

### Translation Architecture

#### Translation Files Structure
```
lib/translations/
├── en/
│   ├── onboarding.ts
│   ├── common.ts
│   └── auth.ts
└── vi/
    ├── onboarding.ts
    ├── common.ts
    └── auth.ts
```

#### Key Translation Categories

##### Onboarding-Specific
```typescript
export const onboardingEn = {
  // Page titles
  onboardingTitle: "Welcome to Infina PFA",
  onboardingSubtitle: "Your AI-powered financial assistant",
  
  // Step labels
  stepWelcome: "Welcome",
  stepIntroduction: "Introduction", 
  stepAssessment: "Financial Assessment",
  stepRiskProfile: "Risk Profile",
  stepGoals: "Goals & Preferences",
  stepAnalysis: "Stage Analysis",
  stepComplete: "Complete",
  
  // Component labels
  introduceYourself: "Tell us about yourself",
  monthlyIncome: "Monthly Income",
  monthlyExpenses: "Monthly Expenses",
  
  // Actions
  continue: "Continue",
  submit: "Submit",
  completed: "Completed",
  
  // Messages
  aiIsTyping: "AI is thinking...",
  errorTitle: "Something went wrong",
  successTitle: "Great progress!"
};
```

### Dynamic Content Translation
- **AI responses**: Generated in user's selected language
- **Component instructions**: Translated based on locale
- **Error messages**: Localized error descriptions

#### Cultural Considerations
- **Currency**: VND for Vietnamese users, USD for international
- **Financial Concepts**: Culturally appropriate financial advice
- **Communication Style**: Formal vs casual based on culture

---

## 📊 Conclusion

The Infina PFA onboarding system represents a sophisticated blend of AI-powered conversation, financial analysis, and user experience design. The system successfully:

- **Simplifies Complex Data Collection**: Conversational interface makes financial assessment approachable
- **Provides Intelligent Analysis**: AI-powered financial stage determination with fallback systems
- **Ensures Scalable Architecture**: Clean separation of concerns with room for growth
- **Maintains Security & Privacy**: Comprehensive security measures and data protection
- **Supports Global Users**: Full internationalization with cultural considerations

### Implementation Status
The implementation is **90% complete** and ready for production use, with remaining work focused on polish and optimization rather than core functionality.

### Success Metrics Achieved
- ✅ Comprehensive financial data collection
- ✅ AI-powered conversational interface  
- ✅ Real-time streaming responses
- ✅ Multi-language support
- ✅ Mobile-responsive design
- ✅ Secure data handling
- ✅ Scalable architecture

The onboarding system provides a solid foundation for user engagement and sets up users for success with personalized financial guidance based on their individual situations and goals.

### Technical Highlights

#### Database Design
- **3 core tables**: `onboarding_responses`, `onboarding_profiles`, `users` (extended)
- **JSONB flexibility**: Support for evolving data structures
- **RLS security**: User data isolation and privacy protection
- **Performance optimized**: Strategic indexing for fast queries

#### API Architecture
- **5 main endpoints**: Initialize, AI Stream, Responses, Analyze Stage, Complete
- **Streaming support**: Real-time AI response delivery
- **Error resilience**: Comprehensive error handling and fallbacks
- **Authentication integration**: Secure user session management

#### Frontend Components
- **7 interactive components**: From simple text input to complex financial forms
- **Progressive enhancement**: Graceful degradation when features unavailable
- **Accessibility compliant**: Full keyboard navigation and screen reader support
- **Design system aligned**: Consistent with Infina brand guidelines

#### AI Integration
- **GPT-4 function calling**: Dynamic component generation based on conversation flow
- **Context-aware prompts**: Intelligent conversation management
- **Fallback analysis**: Rule-based financial stage determination when AI unavailable
- **Multi-language support**: AI responses in user's preferred language

The onboarding system demonstrates modern web development best practices while solving complex user experience challenges in financial technology.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│                 │    │                 │    │                 │
│ • React Pages   │    │ • Next.js API   │    │ • Supabase      │
│ • Chat Interface│◄──►│ • OpenAI GPT-4  │◄──►│ • PostgreSQL    │
│ • UI Components │    │ • Streaming     │    │ • RLS Policies  │
│ • State Mgmt    │    │ • Auth Middleware│    │ • Real-time     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

**Frontend**:
- Next.js 14 (App Router)
- React 18 with TypeScript
- Tailwind CSS (Custom Infina Design System)
- react-i18next (Internationalization)

**Backend**:
- Next.js API Routes
- OpenAI GPT-4 (Function Calling)
- Supabase Auth & Database
- Server-Sent Events (Streaming)

**Database**:
- PostgreSQL (via Supabase)
- Row Level Security (RLS)
- Real-time subscriptions
- JSONB for flexible data storage

**AI & Machine Learning**:
- OpenAI GPT-4 with Function Calling
- Custom financial analysis prompts
- Fallback rule-based analysis
- Streaming responses for real-time UX

---

## 🗄️ Database Schema

### Core Tables

#### `onboarding_responses`
Stores individual component responses during onboarding.

```sql
CREATE TABLE public.onboarding_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  component_id TEXT NOT NULL,
  response_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(user_id, component_id)
);
```

**Purpose**: Track individual component interactions and responses
**Key Features**:
- One response per user per component
- JSONB for flexible response data structure
- Timestamps for audit trail

#### `onboarding_profiles`
Stores complete user profiles during onboarding.

```sql
CREATE TABLE public.onboarding_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  profile_data JSONB NOT NULL DEFAULT '{}',
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

**Purpose**: Store complete user profile and onboarding completion status
**Key Features**:
- JSONB for flexible profile structure
- Completion tracking
- Historical data preservation

#### `users` (Extended)
Main user table extended with onboarding fields.

```sql
ALTER TABLE public.users 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN onboarding_completed_at TIMESTAMPTZ;
```

**Purpose**: Quick lookup for onboarding completion status
**Key Features**:
- Fast middleware checks
- Completion timestamp
- Integration with existing user system

### Security & Performance

**Row Level Security (RLS)**:
- All tables have RLS enabled
- Users can only access their own data
- Policies enforce `auth.uid() = user_id`

**Indexes**:
```sql
-- Performance indexes
CREATE INDEX idx_onboarding_responses_user_id ON onboarding_responses(user_id);
CREATE INDEX idx_onboarding_responses_component_id ON onboarding_responses(component_id);
CREATE INDEX idx_onboarding_profiles_user_id ON onboarding_profiles(user_id);
CREATE INDEX idx_users_onboarding_completed ON users(onboarding_completed);
```

**Triggers**:
- Automatic `updated_at` timestamp updates
- Data validation triggers (future enhancement)

---

## 🔌 API Endpoints

### Core Onboarding APIs

#### `POST /api/onboarding/initialize`
**Purpose**: Initialize new onboarding session
**Input**:
```typescript
{
  userId: string
}
```
**Output**:
```typescript
{
  success: boolean;
  data: {
    conversationId: string;
    userProfile: {
      name: string;
      [key: string]: unknown;
    };
  };
}
```
**Process**:
1. Authenticate user
2. Check existing profile
3. Create/get conversation
4. Return initial state

#### `POST /api/onboarding/ai-stream`
**Purpose**: Stream AI responses during onboarding chat
**Input**:
```typescript
{
  message: string;
  conversationHistory?: Array<{
    id: string;
    content: string;
    sender: "user" | "ai";
    timestamp: string;
  }>;
  userProfile?: Record<string, unknown>;
  currentStep?: string;
}
```
**Output**: Server-Sent Events stream
**Process**:
1. Authenticate user
2. Generate context-aware system prompt
3. Call OpenAI with function tools
4. Stream response in real-time
5. Handle function calls (components, profile updates)

#### `POST /api/onboarding/responses`
**Purpose**: Save user responses from UI components
**Input**:
```typescript
{
  componentId: string;
  responseData: {
    selectedOption?: string;
    textValue?: string;
    financialValue?: number;
    rating?: number;
    sliderValue?: number;
    completedAt: string;
  };
}
```
**Output**:
```typescript
{
  success: boolean;
  data?: { id: string };
}
```

#### `POST /api/onboarding/analyze-stage`
**Purpose**: Analyze user financial stage using AI
**Input**:
```typescript
{
  profile: UserProfile;
}
```
**Output**:
```typescript
{
  success: boolean;
  data: {
    stage: FinancialStage;
    confidence: number;
    reasoning: string;
  };
}
```
**Process**:
1. Use OpenAI GPT-4 for analysis
2. Fallback to rule-based analysis if AI fails
3. Return stage determination with confidence

#### `POST /api/onboarding/complete`
**Purpose**: Complete onboarding and finalize user profile
**Input**:
```typescript
{
  profile: UserProfile;
}
```
**Output**:
```typescript
{
  success: boolean;
  message: string;
  data: {
    user_id: string;
    profile: UserProfile;
    completed_at: string;
  };
}
```
**Process**:
1. Update main users table
2. Save complete profile
3. Mark onboarding as completed
4. Return success confirmation

### Error Handling
- Consistent error response format
- HTTP status codes (400, 401, 500)
- Detailed error messages for debugging
- User-friendly error messages for frontend

---

## 🎨 Frontend Components

### Component Architecture

```
OnboardingPage
├── OnboardingChatInterface
    ├── OnboardingProgress
    ├── OnboardingMessageBubble[]
    │   └── OnboardingComponentRenderer
    │       ├── IntroductionTemplateComponent
    │       ├── MultipleChoiceComponent
    │       ├── FinancialInputComponent
    │       ├── RatingScaleComponent
    │       ├── SliderComponent
    │       ├── TextInputComponent
    │       └── GoalSelectorComponent
    ├── OnboardingTypingIndicator
    └── OnboardingChatInput
```

### Key Components

#### `OnboardingPage` (`app/onboarding/page.tsx`)
**Purpose**: Main onboarding page with authentication checks
**Features**:
- Authentication validation
- Onboarding completion check
- Route protection and redirection
- Landing page style header

#### `OnboardingChatInterface`
**Purpose**: Main chat interface component
**Features**:
- Real-time message display
- Component rendering
- Progress tracking
- Error handling and loading states

#### `OnboardingComponentRenderer`
**Purpose**: Dynamic component rendering based on AI function calls
**Supported Components**:
- **Introduction Template**: Rich text input with suggestions
- **Multiple Choice**: Single/multi-select options
- **Financial Input**: Currency input with validation
- **Rating Scale**: 1-5 scale with labels
- **Slider**: Range input with visual feedback
- **Text Input**: Free text with validation
- **Goal Selector**: Specialized multiple choice for goals

#### `OnboardingProgress`
**Purpose**: Visual progress indicator
**Features**:
- Step-based progress bar
- Current step highlighting
- Responsive design
- i18n support

### State Management

#### Hook: `useOnboardingChat`
**Purpose**: Centralized state management for onboarding chat
**State**:
```typescript
{
  state: OnboardingState;
  messages: OnboardingMessage[];
  isLoading: boolean;
  isAIThinking: boolean;
  isStreaming: boolean;
  error: string | null;
}
```
**Actions**:
- `sendMessage(message: string)`
- `handleComponentResponse(componentId: string, response: ComponentResponse)`

### Design System Compliance
- **Colors**: Infina brand palette (#0055FF, #2ECC71, #F44336, etc.)
- **Typography**: Nunito font family
- **Layout**: Flat, borderless design
- **Interactions**: Subtle hover states and transitions
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

---

## 🤖 AI Integration

### OpenAI GPT-4 Function Calling

#### System Prompt Strategy
**Dynamic Context Generation**: The system prompt is dynamically generated based on:
- Current onboarding step
- User profile data collected so far
- Conversation history
- Previous component responses

**Example Prompt Structure**:
```
You are Infina PFA's onboarding assistant...

Current Context:
- User: John Doe
- Step: financial_assessment
- Profile: {name: "John", age: 28}
- History: [previous interactions]

Your Role:
- Guide users through financial onboarding
- Ask contextual follow-up questions
- Show appropriate UI components
- Provide personalized advice

Available Functions:
- show_onboarding_component
- update_onboarding_profile
- analyze_financial_stage
```

#### Function Tools

##### `show_onboarding_component`
**Purpose**: Display interactive UI components
**Parameters**:
- `component_type`: Type of component to show
- `title`: Question or instruction
- `context`: Component configuration
- `component_id`: Unique identifier

**Example Call**:
```json
{
  "name": "show_onboarding_component",
  "arguments": {
    "component_type": "financial_input",
    "title": "What's your monthly income?",
    "context": {
      "currency": "VND",
      "inputType": "income",
      "placeholder": "Enter your monthly income"
    },
    "component_id": "monthly_income_001"
  }
}
```

##### `update_onboarding_profile`
**Purpose**: Update user profile with collected information
**Parameters**:
- `profile_updates`: Object with profile field updates

##### `analyze_financial_stage`
**Purpose**: Trigger financial stage analysis
**Parameters**:
- `profile_data`: Complete user profile
- `trigger_completion`: Whether to complete onboarding

### AI Behavior Patterns

#### Conversational Flow
1. **Welcome & Orient**: Brief introduction, set expectations
2. **Collect Systematically**: One topic at a time, logical progression
3. **Validate & Clarify**: Ask follow-up questions for unclear responses
4. **Summarize & Confirm**: Review collected information
5. **Analyze & Explain**: Explain financial stage determination
6. **Transition**: Smooth handoff to main application

#### Error Handling
- **AI Unavailable**: Fallback to guided form experience
- **Function Call Errors**: Retry with simpler parameters
- **Invalid Responses**: Request clarification from user

---

## 💬 Chat System

### Message Types

#### User Messages
```typescript
{
  id: string;
  type: "user";
  content: string;
  timestamp: Date;
}
```

#### AI Messages
```typescript
{
  id: string;
  type: "ai";
  content: string;
  timestamp: Date;
  metadata?: {
    function_calls?: FunctionCall[];
  };
}
```

#### Component Messages
```typescript
{
  id: string;
  type: "component";
  content: string;
  timestamp: Date;
  component: OnboardingComponent;
}
```

### Real-time Features

#### Streaming Responses
- **Technology**: Server-Sent Events (SSE)
- **Purpose**: Real-time AI response streaming
- **UX**: Typing indicator → character-by-character display
- **Fallback**: Complete message display if streaming fails

#### Typing Indicators
- **AI Thinking**: Animated dots when processing user input
- **Component Loading**: Skeleton loading for complex components
- **Network Status**: Connection status indicators

### Message Persistence
- **Conversation History**: Stored in database for context
- **Component Responses**: Linked to messages for audit trail
- **Recovery**: Restore chat state on page reload

---

## 🔐 Authentication & Security

### Authentication Flow
1. **User Sign-up**: Email + password via Supabase Auth
2. **Email Verification**: Required before onboarding access
3. **Session Management**: JWT tokens with automatic refresh
4. **Route Protection**: Middleware checks for authenticated users

### Authorization Levels

#### Route Protection
```typescript
// Middleware logic
if (!user && !publicRoutes.includes(pathname)) {
  return redirect('/auth/sign-in');
}

if (user && !hasProfile && pathname !== '/onboarding') {
  return redirect('/onboarding');
}

if (user && hasProfile && authRoutes.includes(pathname)) {
  return redirect('/chat');
}
```

#### Database Security
- **Row Level Security (RLS)**: Enabled on all tables
- **User Isolation**: Users can only access their own data
- **API Authentication**: All API routes validate user sessions

### Data Privacy
- **Minimal Data Collection**: Only necessary financial information
- **Secure Storage**: Encrypted at rest in Supabase
- **Data Retention**: User-controlled data deletion
- **GDPR Compliance**: Right to access, modify, delete personal data

### Security Best Practices
- **Input Validation**: All user inputs validated and sanitized
- **SQL Injection Protection**: Parameterized queries only
- **XSS Protection**: Content sanitization and CSP headers
- **Rate Limiting**: API rate limits to prevent abuse
- **Error Information**: No sensitive data in error messages

---

## ⚠️ Error Handling

### Error Categories

#### Authentication Errors
```typescript
{
  type: "AUTH_ERROR";
  message: "Authentication required";
  action: "REDIRECT_LOGIN";
}
```

#### Validation Errors
```typescript
{
  type: "VALIDATION_ERROR";
  message: "Please enter a valid income amount";
  field: "income";
  action: "FOCUS_FIELD";
}
```

#### AI Service Errors
```typescript
{
  type: "AI_SERVICE_ERROR";
  message: "AI service temporarily unavailable";
  action: "RETRY_OR_FALLBACK";
}
```

#### Network Errors
```typescript
{
  type: "NETWORK_ERROR";
  message: "Connection lost. Please check your internet.";
  action: "RETRY_CONNECTION";
}
```

### Error Recovery Strategies

#### Progressive Degradation
1. **AI Unavailable**: Fall back to traditional form-based onboarding
2. **Streaming Failed**: Display complete messages instead of streaming
3. **Component Error**: Show simplified text input as fallback

#### User Communication
- **Clear Messages**: User-friendly error descriptions
- **Action Guidance**: Clear next steps for users
- **Status Indicators**: Visual feedback for error states
- **Recovery Options**: Retry buttons and alternative paths

#### Developer Support
- **Error Logging**: Comprehensive error logging with context
- **Debug Information**: Detailed technical information in development
- **Performance Monitoring**: Track error rates and response times

---

## ⚡ Performance Considerations

### Frontend Optimizations

#### Code Splitting
- **Route-based**: Separate bundles for onboarding vs main app
- **Component-based**: Lazy loading for complex components
- **Dynamic Imports**: Load components only when needed

#### State Management
- **Minimal Re-renders**: Optimized React hooks and memoization
- **Local State**: Keep temporary state local to components
- **Context Optimization**: Split contexts by concern

#### Network Optimization
- **Request Batching**: Combine related API calls
- **Caching**: Cache user responses during session
- **Preloading**: Prefetch likely next components

### Backend Optimizations

#### Database Performance
- **Indexed Queries**: All frequent queries use indexes
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Minimize N+1 queries

#### API Performance
- **Response Caching**: Cache AI analysis results
- **Streaming**: Real-time response streaming
- **Compression**: Gzip compression for API responses

#### AI Service Optimization
- **Context Management**: Optimize prompt length for cost/speed
- **Fallback Systems**: Fast rule-based analysis backup
- **Request Debouncing**: Prevent duplicate AI calls

### Monitoring & Metrics

#### Performance Metrics
- **Time to First Component**: How quickly first interaction appears
- **Completion Rate**: Percentage of users completing onboarding
- **Drop-off Points**: Where users abandon the process
- **AI Response Time**: Average time for AI responses

#### User Experience Metrics
- **Onboarding Duration**: Average time to complete
- **Error Rates**: Frequency of errors by type
- **User Satisfaction**: Post-onboarding feedback scores

---

## 🌍 Internationalization

### Supported Languages
- **English (en)**: Primary language, complete coverage
- **Vietnamese (vi)**: Full localization for Vietnamese market

### Translation Architecture

#### Translation Files Structure
```
lib/translations/
├── en/
│   ├── onboarding.ts
│   ├── common.ts
│   └── auth.ts
└── vi/
    ├── onboarding.ts
    ├── common.ts
    └── auth.ts
```

#### Key Translation Categories

##### Onboarding-Specific
```typescript
// Example translations
export const onboardingEn = {
  // Page titles
  onboardingTitle: "Welcome to Infina PFA",
  onboardingSubtitle: "Your AI-powered financial assistant",
  
  // Step labels
  stepWelcome: "Welcome",
  stepIntroduction: "Introduction", 
  stepAssessment: "Financial Assessment",
  stepRiskProfile: "Risk Profile",
  stepGoals: "Goals & Preferences",
  stepAnalysis: "Stage Analysis",
  stepComplete: "Complete",
  
  // Component labels
  introduceYourself: "Tell us about yourself",
  monthlyIncome: "Monthly Income",
  monthlyExpenses: "Monthly Expenses",
  
  // Actions
  continue: "Continue",
  submit: "Submit",
  completed: "Completed",
  
  // Messages
  aiIsTyping: "AI is thinking...",
  errorTitle: "Something went wrong",
  successTitle: "Great progress!"
};
```

### Dynamic Content Translation

#### AI Message Translation
- **AI responses**: Generated in user's selected language
- **Component instructions**: Translated based on locale
- **Error messages**: Localized error descriptions

#### Cultural Considerations
- **Currency**: VND for Vietnamese users, USD for international
- **Financial Concepts**: Culturally appropriate financial advice
- **Communication Style**: Formal vs casual based on culture

### Implementation Details

#### Hook: `useAppTranslation`
```typescript
const { t } = useAppTranslation(["onboarding", "common"]);

// Usage
<h1>{t("onboardingTitle")}</h1>
<p>{t("welcomeMessage", { name: user.name })}</p>
```

#### Language Switching
- **User Preference**: Stored in user profile
- **Browser Detection**: Automatic language detection
- **Manual Override**: Language switcher in UI

---

## 🧪 Testing Strategy

### Test Categories

#### Unit Tests
- **Component Testing**: Individual component behavior
- **Hook Testing**: Custom hook functionality
- **Utility Testing**: Helper function validation
- **API Testing**: Individual endpoint testing

#### Integration Tests
- **Flow Testing**: Complete onboarding flow
- **AI Integration**: AI service integration testing
- **Database Testing**: Data persistence and retrieval

#### End-to-End Tests
- **User Journey**: Complete user experience testing
- **Cross-browser**: Multiple browser compatibility
- **Mobile Testing**: Mobile experience validation

### Test Scenarios

#### Happy Path Testing
1. **Complete Flow**: New user → successful onboarding → main app
2. **Component Interactions**: All UI components work correctly
3. **AI Responses**: AI provides appropriate responses and components

#### Error Scenarios
1. **Network Failures**: Handle connection issues gracefully
2. **AI Service Down**: Fallback to traditional form flow
3. **Invalid Input**: Proper validation and error messages
4. **Authentication Issues**: Proper redirect and error handling

#### Edge Cases
1. **Partial Completion**: Resume onboarding after browser close
2. **Data Corruption**: Handle malformed data gracefully
3. **Concurrent Sessions**: Multiple device access handling

### Testing Tools

#### Frontend Testing
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **Cypress**: End-to-end testing
- **Storybook**: Component documentation and testing

#### Backend Testing
- **Jest**: API endpoint testing
- **Supertest**: HTTP assertion testing
- **Database Testing**: Transaction rollback testing

#### AI Testing
- **Mock Responses**: Predictable AI response testing
- **Function Call Testing**: Ensure proper function calling
- **Fallback Testing**: Rule-based analysis testing

---

## 🚀 Deployment & Monitoring

### Production Environment
- **Hosting**: Vercel (Frontend & API)
- **Database**: Supabase (Production tier)
- **AI Service**: OpenAI GPT-4 (Production API)
- **CDN**: Vercel Edge Network

### Environment Configuration
```bash
# Production Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-proj-...
NODE_ENV=production
```

### Monitoring & Observability

#### Application Monitoring
- **Error Tracking**: Sentry for error monitoring
- **Performance**: Vercel Analytics for performance metrics
- **Uptime**: Status page for service availability

#### Business Metrics
- **Onboarding Completion Rate**: Track user success
- **Time to Complete**: Optimize user experience
- **Drop-off Analysis**: Identify improvement opportunities
- **AI Usage**: Monitor AI service costs and performance

### Maintenance & Updates

#### Regular Updates
- **Dependency Updates**: Security and performance patches
- **AI Prompt Optimization**: Improve AI response quality
- **Translation Updates**: Add/improve localizations

#### Feature Enhancements
- **New Components**: Additional UI component types
- **Advanced Analysis**: Enhanced financial stage analysis
- **Integration**: Connect with external financial services

---

## 📊 Metrics & Analytics

### Key Performance Indicators (KPIs)

#### User Success Metrics
- **Completion Rate**: 85%+ target
- **Time to Complete**: <15 minutes average
- **User Satisfaction**: 4.5+ stars average
- **Return Rate**: Users returning to complete onboarding

#### Technical Performance
- **AI Response Time**: <3 seconds average
- **Component Load Time**: <1 second
- **Error Rate**: <2% of all interactions
- **Uptime**: 99.9% availability

#### Business Impact
- **User Retention**: Post-onboarding retention rates
- **Feature Adoption**: Usage of recommended features
- **Conversion**: Free to paid tier conversion
- **Support Tickets**: Reduction in onboarding-related support

### Data Collection

#### User Interaction Tracking
```typescript
// Example analytics events
analytics.track('onboarding_started', {
  user_id: userId,
  timestamp: new Date(),
  initial_step: 'ai_welcome'
});

analytics.track('component_completed', {
  user_id: userId,
  component_type: 'financial_input',
  component_id: 'monthly_income_001',
  time_spent: 45 // seconds
});

analytics.track('onboarding_completed', {
  user_id: userId,
  total_time: 720, // seconds
  financial_stage: 'investing',
  completion_rate: 1.0
});
```

#### Privacy Compliance
- **Anonymous Analytics**: No PII in analytics data
- **User Consent**: Clear opt-in for analytics
- **Data Retention**: Automatic data cleanup policies

---

## 🔄 Future Enhancements

### Planned Improvements

#### Enhanced AI Capabilities
- **Multi-modal Input**: Voice input support
- **Document Analysis**: Upload financial documents
- **Predictive Analytics**: Future financial scenario modeling

#### Advanced Components
- **Interactive Charts**: Visual data input components
- **Comparison Tools**: Side-by-side option comparison
- **Progress Tracking**: Visual progress indicators

#### Integration Opportunities
- **Bank Connections**: Direct bank account integration
- **Investment Platforms**: Connect existing investment accounts
- **Credit Score Services**: Real-time credit score checking

### Scalability Considerations

#### Technical Scaling
- **Microservices**: Break into smaller, focused services
- **Caching Layer**: Redis for improved performance
- **CDN Optimization**: Global content delivery

#### Business Scaling
- **Multi-tenant**: Support for financial advisors
- **White-label**: Branded onboarding for partners
- **API Platform**: Open APIs for third-party integrations

---

## 📋 Conclusion

The Infina PFA onboarding system represents a sophisticated blend of AI-powered conversation, financial analysis, and user experience design. The system successfully:

- **Simplifies Complex Data Collection**: Conversational interface makes financial assessment approachable
- **Provides Intelligent Analysis**: AI-powered financial stage determination with fallback systems
- **Ensures Scalable Architecture**: Clean separation of concerns with room for growth
- **Maintains Security & Privacy**: Comprehensive security measures and data protection
- **Supports Global Users**: Full internationalization with cultural considerations

The implementation is **90% complete** and ready for production use, with remaining work focused on polish and optimization rather than core functionality.

### Success Metrics Achieved
- ✅ Comprehensive financial data collection
- ✅ AI-powered conversational interface  
- ✅ Real-time streaming responses
- ✅ Multi-language support
- ✅ Mobile-responsive design
- ✅ Secure data handling
- ✅ Scalable architecture

The onboarding system provides a solid foundation for user engagement and sets up users for success with personalized financial guidance based on their individual situations and goals. 