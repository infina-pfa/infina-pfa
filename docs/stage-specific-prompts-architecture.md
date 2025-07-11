# Stage-Specific Prompts Architecture

## 📋 Overview

This document describes the new stage-specific prompt architecture for Infina's onboarding flow. Instead of using a single "ALL in One" system prompt, we now have **3 specialized prompts** for each financial stage, providing more targeted and effective guidance.

## 🎯 Problem Solved

**Before**: Single massive prompt trying to handle all financial stages
- Generic advice that wasn't optimized for specific situations
- Complex logic branches within one prompt
- Difficult to maintain and optimize
- Less focused conversations

**After**: Stage-specific prompts with targeted expertise
- Specialized advice for each financial stage
- Cleaner, focused prompt logic
- Easy to maintain and optimize individual stages
- More effective and relevant conversations

## 🏗️ Architecture Overview

```
Decision Tree (Stage Identification)
           ↓
    Prompt Orchestrator
           ↓
┌─────────┬─────────┬─────────┐
│  DEBT   │ SAVING  │INVESTING│
│ Stage   │ Stage   │ Stage   │
│ Prompt  │ Prompt  │ Prompt  │
└─────────┴─────────┴─────────┘
```

## 📁 File Structure

```
lib/ai-advisor/prompts/
├── debt-stage-prompt.ts              # Debt elimination focused
├── start-saving-stage-prompt.ts      # Emergency fund focused (MAIN)
├── start-investing-stage-prompt.ts   # Investment foundation focused
├── onboarding-system-prompt.ts       # Stage identification (original)
├── prompt-orchestrator.ts            # Routing logic
└── index.ts                          # Centralized exports
```

## 🎭 Stage-Specific Prompts

### 1. Debt Stage Prompt (`debt-stage-prompt.ts`)

**Focus**: Debt elimination and financial stability
**Target Users**: Users with high-interest debt (>15% annually)

**Key Features**:
- Debt assessment and categorization
- Debt avalanche vs snowball strategy selection
- Budget optimization for maximum debt payments
- Payment plan creation with milestones
- Automation and monitoring setup

**5-Step Flow**:
1. **Debt Assessment** - Complete inventory of all debts
2. **Payoff Strategy** - Choose optimal elimination method
3. **Budget Optimization** - Maximize payment capacity
4. **Payment Plan** - Detailed timeline with milestones
5. **Automation** - Set up automatic payments and tracking

### 2. Start Saving Stage Prompt (`start-saving-stage-prompt.ts`)

**Focus**: Emergency fund establishment (MAIN IMPLEMENTATION)
**Target Users**: Users without debt but no emergency savings

**Key Features**:
- Emergency fund importance education
- Expense collection and analysis
- Savings capacity optimization using 5-3-2 method
- 6-month timeline targeting
- HYSA and "pay yourself first" guidance

**5-Step Flow**:
1. **Emergency Fund Education** - Convince importance
2. **Expense Collection** - 4 categories + additional
3. **Savings Capacity** - Monthly saving ability assessment
4. **Goal Confirmation** - 3x expenses target approval
5. **Infina Account Setup** - HYSA and automation

### 3. Start Investing Stage Prompt (`start-investing-stage-prompt.ts`)

**Focus**: Investment foundation and education
**Target Users**: Users with emergency fund ready for wealth building

**Key Features**:
- Financial foundation validation
- Investment goal and timeline setting
- Vietnamese investment landscape education
- Portfolio allocation recommendations
- Account setup and systematic investing

**5-Step Flow**:
1. **Foundation Validation** - Confirm readiness for investing
2. **Goal & Timeline** - Define investment objectives
3. **Investment Education** - Vietnamese market options
4. **Portfolio Allocation** - Personalized asset allocation
5. **Implementation** - Account setup and automation

## 🎯 Prompt Orchestrator

The `prompt-orchestrator.ts` serves as the intelligent routing system:

### Main Function
```typescript
generateStageSpecificPrompt({
  userId: string,
  userProfile: Record<string, unknown>,
  conversationHistory: Array<{role: string, content: string}>,
  currentStep: string
}): string
```

### Stage Selection Logic
1. **No Stage Identified** → Use original onboarding prompt for decision tree
2. **Debt Stage** → Route to debt elimination prompt
3. **Start Saving Stage** → Route to emergency fund prompt
4. **Start Investing Stage** → Route to investment foundation prompt

### Validation Features
- **Stage Compatibility Check**: Ensures user is in appropriate stage
- **Automatic Redirection**: Moves users to correct stage if needed
- **Progress Tracking**: Monitors stage completion criteria

## 🔄 Integration Points

### API Route Updates
`/app/api/onboarding/ai-stream/route.ts` now uses:
```typescript
// Old approach
const systemInstructions = generateOnboardingSystemPrompt(...)

// New approach  
const systemInstructions = generateStageSpecificPrompt({
  userId: user.id,
  userProfile: requestBody.userProfile || {},
  conversationHistory: [],
  currentStep: requestBody.currentStep || "ai_welcome"
});
```

### Stage Validation
```typescript
const stageValidation = validateStageCompatibility(identifiedStage, userProfile);
if (!stageValidation.isValid) {
  // Redirect to appropriate stage
  console.warn('⚠️ Stage compatibility issue:', stageValidation);
}
```

## 🎨 Key Benefits

### 1. **Laser-Focused Conversations**
- Each prompt is optimized for specific financial situation
- No generic advice that doesn't apply
- Targeted education and component usage

### 2. **Better User Experience**
- More relevant and actionable guidance
- Faster progress through focused flows
- Clear stage-specific milestones

### 3. **Easier Maintenance**
- Each stage can be updated independently
- Cleaner code with single responsibility
- Better testing and optimization

### 4. **Scalability**
- Easy to add new stages in the future
- Modular architecture supports growth
- Clear separation of concerns

## 🚀 Usage Examples

### Stage Identification Flow
```
User: "Tôi muốn bắt đầu đầu tư"
↓
Decision Tree Component: "Bạn có nợ thẻ tín dụng không?"
↓
User: "Không, nhưng tôi chưa có tiền dự phòng"
↓
Stage Identified: "start_saving"
↓
Load: start-saving-stage-prompt.ts
↓
Focus: Emergency fund establishment
```

### Stage-Specific Guidance
```
Start Saving Stage:
- "Trước khi đầu tư, bạn cần quỹ dự phòng"
- "Hãy bắt đầu với 3 tháng chi tiêu"
- "Tôi sẽ giúp bạn tính toán và lập kế hoạch"

Start Investing Stage:
- "Tuyệt! Bạn đã có nền tảng vững chắc"
- "Hãy xác định mục tiêu đầu tư của bạn"
- "Tôi sẽ tạo portfolio phù hợp với bạn"
```

## 🔧 Configuration

### Environment Variables
No new environment variables required. Uses existing OpenAI configuration.

### Logging & Debugging
Enhanced logging for prompt selection:
```typescript
logPromptSelection(userId, identifiedStage, promptType, userProfile);
```

## 📈 Performance Impact

### Positive Impacts
- **Faster LLM Processing**: Smaller, focused prompts
- **Better Token Efficiency**: Less irrelevant context
- **Improved Response Quality**: More targeted advice

### Metrics to Monitor
- Conversation completion rates per stage
- Time to stage completion
- User satisfaction scores
- Stage transition success rates

## 🔮 Future Enhancements

### Additional Stages
- **Advanced Investing**: For experienced investors
- **Retirement Planning**: Specialized retirement focus
- **Business Finance**: For entrepreneurs

### Dynamic Stage Updates
- Real-time stage reassessment based on user progress
- Automatic stage transitions when criteria met
- Cross-stage recommendations and referrals

## 🚨 Migration Notes

### Breaking Changes
- API imports updated to use prompt orchestrator
- TypeScript types added for financial stages
- Enhanced logging and validation

### Backward Compatibility
- Original onboarding prompt still available for stage identification
- Existing user profiles compatible with new system
- Gradual rollout possible through feature flags

## 🎉 Success Metrics

### Quantitative
- **Stage Completion Rate**: >80% users complete their identified stage
- **Timeline Adherence**: >70% users achieve goals within suggested timeframe
- **Engagement**: >50% increase in conversation depth and quality

### Qualitative
- More relevant and actionable advice
- Clearer understanding of financial priorities
- Higher confidence in financial decisions
- Better product fit for Vietnamese market

---

This architecture represents a significant improvement in personalization and effectiveness, moving from generic financial advice to stage-specific expertise that meets users exactly where they are in their financial journey. 