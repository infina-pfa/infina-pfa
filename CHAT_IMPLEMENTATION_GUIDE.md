# Chat Implementation Guide

## Overview

The chat feature integrates with the existing conversations and messages schema to provide an interactive chat interface for users to communicate with the AI assistant about financial topics.

## Architecture

### Components Structure

```
app/chat/page.tsx                 # Main chat page
components/chat/
  ├── conversation-sidebar.tsx    # Sidebar with conversation list
  ├── chat-area.tsx              # Main chat messages and input
  ├── empty-state.tsx            # Welcome screen when no conversation selected
  └── index.ts                   # Component exports
```

### Database Schema Integration

The chat page leverages existing database tables:

- **`user_conversations`** - Stores conversation metadata
  - `id`, `title`, `user_id`, `created_at`, `deleted_at`, `latest_response_id`
- **`user_messages`** - Stores individual messages
  - `id`, `content`, `conversation_id`, `sender_type`, `created_at`, `meta_data`

### Hooks Used

- `useConversationList()` - Fetches and manages conversation list
- `useConversationCreate()` - Creates new conversations
- `useConversationMessages(conversationId)` - Fetches messages for a conversation
- `useMessageCreate()` - Creates new messages (user and bot)

## Features

### 1. Conversation Management

- **List all conversations** in the sidebar
- **Search conversations** by title
- **Create new conversations** with custom titles
- **Select active conversation** to view messages
- **Conversation previews** with creation date and message count

### 2. Message System

- **Send user messages** with Enter key (Shift+Enter for new line)
- **Auto-resizing textarea** for message input
- **Message bubbles** with distinct styling for USER vs BOT
- **Timestamps** for each message
- **Loading states** for sending messages
- **Auto-scroll** to latest message

### 3. UI/UX Features

- **Empty state** with suggested conversation topics
- **Responsive design** with sidebar and main area
- **Loading skeletons** for better perceived performance
- **Error handling** with user-friendly messages
- **Infina brand colors** and flat design principles

### 4. Suggested Topics

The empty state includes financial-focused conversation starters:

- Financial planning advice
- Budget optimization tips
- Investment strategies
- Expense tracking help
- Savings goals planning
- Debt management advice

## Usage Examples

### Starting a New Conversation

```typescript
// From the empty state
onCreateConversation("Budget optimization tips");

// This will:
// 1. Create a new conversation with the title
// 2. Refresh the conversation list
// 3. Select the new conversation
// 4. Show the chat area ready for messages
```

### Sending a Message

```typescript
// User types message and presses Enter
onSendMessage("How can I optimize my monthly budget?");

// This will:
// 1. Add a USER message to the conversation
// 2. Refresh the message list
// 3. Show sending state with loading animation
// 4. Clear the input field
```

### Bot Response Integration

To add bot responses, you would typically:

```typescript
// After user sends message, trigger AI response
const { addBotMessage } = useMessageCreate();

// Add bot response (integrate with your AI service)
await addBotMessage(
  conversationId,
  "Here are some budget optimization strategies...",
  {
    ai_model: "gpt-4",
    response_time_ms: 1250,
    confidence: 0.95,
  }
);
```

## Design Philosophy

### Infina Brand Compliance

- **Primary Blue** (`#0055FF`) for action buttons and user messages
- **Emerald Green** (`#2ECC71`) for bot messages and success states
- **Flat design** with no shadows or borders
- **Rounded corners** for modern, friendly appearance
- **Nunito font family** (inherited from global styles)

### User Experience

- **Familiar chat patterns** similar to popular messaging apps
- **Clear visual hierarchy** between different message types
- **Responsive interactions** with immediate feedback
- **Graceful loading states** to maintain engagement
- **Keyboard shortcuts** for power users

## Integration Points

### Authentication

The chat page automatically inherits user authentication from the app's auth system. All conversations and messages are scoped to the authenticated user via `user_id`.

### Real-time Updates (Future Enhancement)

The current implementation uses manual refresh. For real-time updates, consider integrating:

- WebSocket connections
- Supabase real-time subscriptions
- Server-sent events

### AI Integration (Future Enhancement)

To complete the chat experience, integrate with an AI service:

- OpenAI GPT API
- Claude API
- Custom financial AI model

## File Locations

- **Main Page**: `/app/chat/page.tsx`
- **Components**: `/components/chat/`
- **Hooks**: `/hooks/conversation/` and `/hooks/message/`
- **Types**: `/lib/types/conversation.types.ts` and `/lib/types/message.types.ts`
- **Services**: `/lib/services/conversation.service.ts` and `/lib/services/message.service.ts`

## Next Steps

1. **Test the implementation** by navigating to `/chat`
2. **Add AI integration** for bot responses
3. **Implement real-time updates** for better UX
4. **Add message reactions** or other interactive features
5. **Integrate with financial data** for contextual responses
