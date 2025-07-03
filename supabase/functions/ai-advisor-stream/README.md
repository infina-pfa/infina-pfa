# AI Advisor Stream Function

## Overview
This function provides streaming AI responses with support for UI actions including tool opening, component showing, and suggestions.

## Recent Updates

### ✅ Show Component Feature Added
- Added `show_component` function tool to display UI components instead of long text responses
- Supports 5 component types: `budget-overview`, `budget-detail`, `expense-summary`, `income-summary`, `financial-dashboard`
- Full integration with both OpenAI and Gemini streaming handlers

### ✅ Streaming Logic Updated  
- Updated streaming logic to match `send-to-advisor` format
- Added `ResponseDataEvent` enum for consistent event handling
- Improved error handling and stream completion detection

### ✅ Frontend Integration
- Updated `AIAdvisor.tsx` to call `ai-advisor-stream` instead of `send-to-advisor`
- Added provider selection support (defaults to OpenAI)
- Existing `useAIAdvisorStreamProcessor` hook is fully compatible

## Function Tools Available

### 1. Open Tool (`open_tool`)
Opens specialized financial tools for user interaction.
```json
{
  "tool_id": "budget-tool|loan-calculator|interest-calculator|salary-calculator|bank-interest-compare|learning-center",
  "title": "Tool title",
  "trigger_reason": "Why this tool is suggested",
  "context": {} // Optional additional context
}
```

### 2. Show Component (`show_component`) 
Displays UI components with financial data visualizations.
```json
{
  "component_id": "budget-overview|budget-detail|expense-summary|income-summary|financial-dashboard",
  "title": "Component title",
  "context": {} // Optional additional context
}
```

### 3. Show Suggestion (`show_suggestion`)
Shows contextual tips and recommendations.
```json
{
  "suggestion_type": "tip|warning|recommendation|insight",
  "title": "Suggestion title", 
  "content": "Suggestion content"
}
```

## Usage Guidelines

### When to Use Show Component
- User asks for financial overviews: "Cho tôi xem tổng quan ngân sách"
- User wants spending analysis: "Phân tích chi tiêu của tôi"
- User requests financial dashboard: "Hiển thị bảng điều khiển tài chính"

### When to Use Open Tool
- User needs calculations: "Tính lãi vay 100 triệu"
- User wants comparisons: "So sánh lãi suất ngân hàng"
- User asks for interactive tools: "Mở công cụ ngân sách"

## API Request Format
```json
{
  "message": "User message",
  "conversationHistory": [], 
  "userContext": {},
  "conversationId": "conversation-id",
  "user_id": "user-id",
  "provider": "openai|gemini" // Optional, defaults to openai
}
```

## Stream Response Format
Events follow `ResponseDataEvent` enum:
- `response_created` - Response initiated
- `response_output_text_streaming` - Text content streaming 
- `response_output_text_done` - Text complete
- `response_function_call_arguments_streaming` - Function call in progress
- `response_function_call_arguments_done` - Function call complete with action
- `response_completed` - Full response complete

## Migration from send-to-advisor
The AI Advisor page now uses `ai-advisor-stream` with enhanced features:
- ✅ Same streaming interface 
- ✅ Additional component showing capability
- ✅ Better provider support (OpenAI + Gemini)
- ✅ Enhanced error handling 

# AI Advisor Stream - Memory Manager Architecture

## Overview
The memory manager has been refactored into a modular, maintainable architecture following Domain-Driven Design (DDD) principles and the project's 100-line file limit rule.

## Architecture

### Core Components

#### 1. Types (`types/memory.ts`)
- `Memory`: Core memory entity interface
- `MemoryConfig`: Configuration interface  
- `ConversationMessage`: Message format for conversations
- `MemoryExtractionResponse`: AI extraction response format
- `MemoryCategory`: Categorization enum for financial advisor context

#### 2. Configuration (`config/memory.config.ts`)
- `MemoryConfigFactory`: Creates configuration from environment variables
- `MEMORY_CONSTANTS`: Constants for models, limits, and processing parameters

#### 3. Services (`services/`)

##### Memory Persistence Service (`memory-persistence.service.ts`)
- Handles background database operations
- Implements queue-based processing to avoid blocking
- Manages CRUD operations for memory storage

##### Embedding Service (`embedding.service.ts`)
- Generates text embeddings using OpenAI
- Handles embedding model configuration
- Provides error handling for embedding generation

##### Memory Extraction Service (`memory-extraction.service.ts`)
- Extracts meaningful facts from user messages
- Categorizes information for financial advisor context
- Filters out routine/irrelevant information
- Implements intelligent pattern recognition

##### Memory Manager Factory (`memory-manager.factory.ts`)
- Creates configured AsyncMemoryManager instances
- Handles dependency injection
- Provides a clean interface for instantiation

#### 4. Main Manager (`memory-manager.ts`)
- Orchestrates all services
- Provides high-level memory operations
- Maintains backward compatibility with existing API

## Usage

### Basic Usage
```typescript
import { MemoryManagerFactory } from './services/index.ts';

// Create configured memory manager
const memoryManager = MemoryManagerFactory.create();

// Add memory
await memoryManager.addMemory(
  "User is 28 years old and works in marketing", 
  userId,
  { category: "PERSONAL_DEMOGRAPHIC" }
);

// Process conversation
await memoryManager.processLastMessage(userMessage, aiResponse, userId);

// Fetch memories for context
const context = await memoryManager.fetchAllUserMemories(userId);
```

### Advanced Configuration
```typescript
import { MemoryManagerFactory } from './services/index.ts';

const memoryManager = MemoryManagerFactory.create({
  backgroundPersist: false, // Disable background processing
  // Other config overrides...
});
```

## Benefits of Refactored Architecture

1. **Maintainability**: Each service has a single responsibility
2. **Testability**: Services can be tested independently
3. **Modularity**: Easy to swap implementations or add features
4. **Code Reuse**: Services can be used independently
5. **File Size Compliance**: All files under 100 lines
6. **Dependency Injection**: Clean separation of concerns
7. **Error Isolation**: Failures in one service don't affect others

## File Structure
```
ai-advisor-stream/
├── types/
│   └── memory.ts (40 lines)
├── config/
│   └── memory.config.ts (32 lines)
├── services/
│   ├── memory-persistence.service.ts (85 lines)
│   ├── embedding.service.ts (28 lines)
│   ├── memory-extraction.service.ts (88 lines)
│   ├── memory-manager.factory.ts (32 lines)
│   └── index.ts (5 lines)
└── memory-manager.ts (95 lines)
```

## Memory Categories
The system categorizes extracted information into:
- `PERSONAL_DEMOGRAPHIC`: Age, job, location, income
- `FINANCIAL_GOALS`: Investment goals, purchase plans
- `FINANCIAL_ATTITUDE`: Risk tolerance, preferences
- `FINANCIAL_CIRCUMSTANCES`: Current financial state
- `LIFESTYLE_PREFERENCES`: Spending habits, lifestyle choices
- `FAMILY_CONTEXT`: Family size, dependents, relationships

## Future Enhancements
- Add memory search capabilities
- Implement memory similarity scoring
- Add memory expiration policies
- Implement memory conflict resolution
- Add performance metrics and monitoring 

# AI Advisor Stream Function - Flow Documentation

## 📋 Tổng quan

AI Advisor Stream Function là một serverless function xử lý streaming AI responses từ OpenAI và Gemini, với khả năng memory management, UI action triggering, và MCP tool integration.

## 🏗️ Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI Advisor Stream Function                   │
├─────────────────────────────────────────────────────────────────┤
│  Entry Point: index.ts                                         │
│  ├── Request Validation & CORS                                 │
│  ├── AI Advisor Orchestrator Service                           │
│  └── Streaming Response                                         │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Cấu trúc thư mục

```
ai-advisor-stream/
├── index.ts                          # Entry point chính
├── memory-manager.ts                  # Async memory processing
├── config/
│   ├── index.ts                      # Cấu hình LLM providers
│   └── memory.config.ts              # Cấu hình memory system
├── constants/
│   └── index.ts                      # Constants và error messages
├── handlers/
│   ├── base-stream-handler.ts        # Abstract base cho stream handlers
│   ├── openai-stream-handler.ts      # OpenAI stream processing
│   ├── gemini-stream-handler.ts      # Gemini stream processing
│   ├── function-call.processor.ts    # Function call processing
│   ├── memory-handler.ts             # Memory processing logic
│   ├── mcp-setup.ts                  # MCP tools setup
│   └── gemini-client.ts              # Gemini API client
├── services/
│   ├── ai-advisor-orchestrator.service.ts  # Main orchestration logic
│   ├── ui-action.service.ts          # UI action processing
│   ├── memory-*.service.ts           # Memory related services
│   └── index.ts                      # Services exports
├── types/
│   ├── index.ts                      # Main type definitions
│   └── memory.ts                     # Memory specific types
├── utils/
│   ├── context.ts                    # Context preparation utilities
│   ├── memory.utils.ts               # Memory utilities
│   └── validation.ts                 # Validation helpers
├── tools/
│   └── definitions.ts                # Tool definitions cho AI
└── prompts/
    └── system-prompt.ts              # System prompt generation
```

## 🔄 Flow xử lý chi tiết

### 1. **Request Entry (index.ts)**

```typescript
POST /ai-advisor-stream
├── CORS validation
├── Method validation (POST only)
├── Request body parsing
└── Initialize AI Advisor Orchestrator
```

**Input:**
```typescript
{
  message: string,
  conversationHistory: ConversationMessage[],
  userContext: UserContext,
  conversationId?: string,
  user_id: string,
  provider?: 'openai' | 'gemini'
}
```

### 2. **Orchestrator Service Processing**

#### 2.1 Initialization
```typescript
AIAdvisorOrchestratorService
├── OpenAI Client setup
├── Memory Manager creation (background)
├── MCP Config initialization
└── Provider selection (OpenAI/Gemini)
```

#### 2.2 Context Preparation
```typescript
prepareContexts()
├── User Context processing
├── Memory Context retrieval
├── Conversation History formatting
└── Combined context generation
```

#### 2.3 Tools & Prompts Setup
```typescript
setupToolsAndPrompts()
├── MCP Tools setup (background API calls)
├── Function Tools loading
├── System Prompt generation
└── Message preparation
```

### 3. **Stream Processing by Provider**

#### 3.1 OpenAI Stream Flow
```typescript
OpenAIStreamHandler extends BaseStreamHandler
├── Response Creation handling
├── Content Delta processing
│   ├── Text streaming
│   └── Content accumulation
├── Function Call Arguments handling
│   ├── Arguments delta accumulation
│   └── MCP call processing
├── Function Call Completion
│   ├── UI Action processing
│   └── Tool execution
└── Stream completion
```

#### 3.2 Gemini Stream Flow
```typescript
GeminiStreamHandler extends BaseStreamHandler
├── Chunk processing
├── Text content handling
├── Function Call detection
│   ├── Tool call events
│   ├── UI Action generation
│   └── Segment management
└── Stream completion
```

### 4. **Function Call Processing**

```typescript
FunctionCallProcessor
├── Arguments Delta handling
│   ├── Accumulation
│   └── Streaming events
├── MCP Call processing
├── UI Function Completion
│   ├── Data validation
│   ├── UI Action creation
│   └── Event emission
└── Function call storage
```

### 5. **UI Action Processing**

```typescript
UIActionService
├── OpenAI Function Processing
│   ├── Payload extraction
│   └── Action structure creation
├── Gemini Function Processing
│   ├── Function validation
│   ├── Provider-specific metadata
│   └── Action structure creation
├── UI Action Events
└── Error handling
```

### 6. **Memory Processing (Background)**

```typescript
AsyncMemoryManager (Non-blocking)
├── Memory Context retrieval
├── Memory Extraction
│   ├── Conversation analysis
│   ├── Key information extraction
│   └── Memory persistence
├── Embedding generation
└── Vector storage
```

## 🔧 Các component chính

### BaseStreamHandler
- **Vai trò**: Abstract base class cho tất cả stream handlers
- **Chức năng**: Common streaming functionality, error handling, event emission
- **Methods**: `sendEvent()`, `endStream()`, `sendError()`, `addToResponse()`

### OpenAIStreamHandler
- **Vai trò**: Xử lý OpenAI streaming responses
- **Chức năng**: Handle response creation, content deltas, function calls
- **Dependencies**: FunctionCallProcessor

### GeminiStreamHandler  
- **Vai trò**: Xử lý Gemini streaming responses
- **Chức năng**: Process chunks, handle function calls, UI actions
- **Dependencies**: UIActionService

### FunctionCallProcessor
- **Vai trò**: Centralized function call processing
- **Chức năng**: Handle function arguments, MCP calls, UI actions
- **Used by**: OpenAIStreamHandler

### UIActionService
- **Vai trò**: UI action processing and validation
- **Chức năng**: Convert function calls to UI actions, provider-agnostic
- **Used by**: Both stream handlers

### AIAdvisorOrchestratorService
- **Vai trò**: Main coordination service
- **Chức năng**: Request processing, provider selection, context preparation
- **Dependencies**: All other services

## 📊 Event Flow Diagram

```
Client Request
     ↓
┌─────────────────┐
│   index.ts      │
│ ┌─────────────┐ │
│ │CORS + Validation│
│ └─────────────┘ │
└─────────────────┘
     ↓
┌─────────────────┐
│  Orchestrator   │
│ ┌─────────────┐ │
│ │Context Prep │ │
│ │Tools Setup  │ │
│ │Provider Select│ │
│ └─────────────┘ │
└─────────────────┘
     ↓
┌─────────────────┐    ┌─────────────────┐
│  OpenAI Stream  │ OR │  Gemini Stream  │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │Text Content │ │    │ │Chunk Process│ │
│ │Function Call│ │    │ │Function Call│ │
│ │UI Actions   │ │    │ │UI Actions   │ │
│ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘
     ↓                         ↓
┌─────────────────────────────────────────┐
│           Stream Events                 │
│ ┌─────────────────────────────────────┐ │
│ │ • text content streaming            │ │
│ │ • function call events              │ │  
│ │ • ui_action events                  │ │
│ │ • tool execution events             │ │
│ │ • completion events                 │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
     ↓
┌─────────────────┐
│   Client        │
│ ┌─────────────┐ │
│ │UI Updates   │ │
│ │Tool Triggers│ │
│ │Content Display│ │
│ └─────────────┘ │
└─────────────────┘
```

## 🛠️ Stream Events

### Content Events
```typescript
{
  type: 'OUTPUT_TEXT_STREAMING',
  content: string,
  timestamp: string
}
```

### UI Action Events
```typescript
{
  type: 'ui_action',
  action: {
    type: 'OPEN_TOOL' | 'SHOW_COMPONENT' | 'SHOW_SUGGESTION',
    payload: { toolId, title, context },
    metadata: { provider, timestamp, userIntent }
  },
  timestamp: string
}
```

### Function Call Events
```typescript
{
  type: 'FUNCTION_CALL_ARGUMENTS_DONE',
  action: { type, payload },
  timestamp: string
}
```

## ⚡ Performance Optimizations

### 1. **Non-blocking Memory Processing**
- Memory operations chạy background
- Không block streaming response
- Async queue processing

### 2. **Efficient Stream Handling**
- Chunk-based processing
- Minimal buffering
- Event-driven architecture

### 3. **Provider Abstraction**
- Unified interface cho multiple LLM providers
- Provider-specific optimizations
- Fallback mechanisms

## 🔍 Error Handling

### Stream Level
```typescript
try {
  // Stream processing
} catch (error) {
  streamHandler.sendError(error);
}
```

### Service Level
```typescript
// Graceful degradation
// Error context preservation
// User-friendly error messages
```

## 🧪 Testing Strategy

### Unit Tests
- Individual component testing
- Service isolation
- Mock dependencies

### Integration Tests  
- End-to-end flow testing
- Provider switching
- Error scenarios

### Performance Tests
- Stream latency
- Memory usage
- Concurrent requests

## 📝 Usage Examples

### Basic Request
```typescript
const response = await fetch('/ai-advisor-stream', {
  method: 'POST',
  body: JSON.stringify({
    message: "Tôi muốn tạo budget mới",
    user_id: "user123",
    provider: "openai"
  })
});

const reader = response.body.getReader();
// Process streaming events
```

### UI Action Handling
```typescript
// Client side event processing
const eventData = JSON.parse(chunk);
if (eventData.type === 'ui_action') {
  switch(eventData.action.type) {
    case 'OPEN_TOOL':
      openTool(eventData.action.payload);
      break;
    case 'SHOW_COMPONENT':
      showComponent(eventData.action.payload);
      break;
  }
}
```

## 🚀 Deployment & Monitoring

### Environment Variables
- `OPENAI_API_KEY`
- `GEMINI_API_KEY` 
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### Monitoring Points
- Response latency
- Error rates
- Memory usage
- Stream completion rates

---

**Created:** $(date)  
**Version:** 1.0.0  
**Maintainer:** AI Advisor Stream Team 