# User Conversations & Messages CRUD Implementation

Complete CRUD system for managing user conversations and messages with full TypeScript support, following SOLID principles and single-responsibility patterns.

## Architecture Overview

### Database Schema

- **user_conversations**: Stores conversation metadata
  - `id`, `title`, `user_id`, `latest_response_id`, `created_at`, `deleted_at`
- **user_messages**: Stores individual messages within conversations
  - `id`, `content`, `conversation_id`, `sender_type` (BOT|USER), `meta_data`, `user_id`, `created_at`, `updated_at`

### Service Layer Pattern

All API calls go through dedicated service layers:

- `conversationService` - Handles all conversation operations
- `messageService` - Handles all message operations

## Conversation Management

### Types

```typescript
// Core types from database schema
type Conversation = Tables<"user_conversations">;
type ConversationInsert = TablesInsert<"user_conversations">;
type ConversationUpdate = TablesUpdate<"user_conversations">;

// API request/response types
interface CreateConversationRequest {
  title: string;
  latest_response_id?: string | null;
}

interface UpdateConversationRequest {
  title?: string;
  latest_response_id?: string | null;
  deleted_at?: string | null;
}

interface GetConversationsQuery {
  include_deleted?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}
```

### Service Usage

#### List Conversations

```typescript
import { conversationService } from "@/lib/services/conversation.service";

// Get all active conversations
const conversations = await conversationService.getAll();

// Get with filters
const filtered = await conversationService.getAll({
  search: "project",
  limit: 10,
  include_deleted: false,
});

// Search conversations
const results = await conversationService.search("AI assistant", { limit: 5 });
```

#### Create Conversation

```typescript
// Create new conversation
const newConversation = await conversationService.create({
  title: "AI Chat Session",
  latest_response_id: null,
});
```

#### Update Conversation

```typescript
// Update conversation title
const updated = await conversationService.update("conv_id", {
  title: "Updated Chat Session",
});

// Soft delete conversation
const deleted = await conversationService.softDelete("conv_id");

// Restore soft-deleted conversation
const restored = await conversationService.restore("conv_id");
```

#### Analytics

```typescript
// Get conversation summary
const summary = await conversationService.getSummary();
// Returns: { total: 25, active: 20, deleted: 5, recent_count: 8 }
```

### Hook Usage

#### Single Responsibility Hooks

```typescript
import {
  useConversationList,
  useConversationCreate,
  useConversationUpdate,
  useConversationDelete,
  useConversation,
  useConversationSummary,
} from "@/hooks/conversation";

// List conversations with auto-refresh
const ConversationList = () => {
  const { conversations, isLoading, error, refetch } = useConversationList({
    limit: 20,
    include_deleted: false,
  });

  if (isLoading) return <div>Loading conversations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {conversations.map((conv) => (
        <div key={conv.id}>{conv.title}</div>
      ))}
    </div>
  );
};

// Create conversation
const CreateConversationForm = () => {
  const { createConversation, isCreating, error } = useConversationCreate();

  const handleCreate = async (title: string) => {
    const result = await createConversation({ title });
    if (result) {
      console.log("Created:", result);
    }
  };

  return (
    <div>
      <button onClick={() => handleCreate("New Chat")} disabled={isCreating}>
        {isCreating ? "Creating..." : "Create Conversation"}
      </button>
      {error && <div>Error: {error}</div>}
    </div>
  );
};

// Update conversation
const EditConversation = ({ conversationId }: { conversationId: string }) => {
  const { updateConversation, isUpdating, error } = useConversationUpdate();

  const handleUpdate = async (newTitle: string) => {
    const result = await updateConversation(conversationId, {
      title: newTitle,
    });
    if (result) {
      console.log("Updated:", result);
    }
  };

  return (
    <button onClick={() => handleUpdate("Updated Title")} disabled={isUpdating}>
      {isUpdating ? "Updating..." : "Update Title"}
    </button>
  );
};

// Single conversation details
const ConversationDetails = ({ id }: { id: string }) => {
  const { conversation, isLoading, error, refetch } = useConversation(id);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!conversation) return <div>Conversation not found</div>;

  return (
    <div>
      <h3>{conversation.title}</h3>
      <p>Created: {new Date(conversation.created_at).toLocaleDateString()}</p>
    </div>
  );
};
```

#### Composition Hook

```typescript
import { useConversationManagement } from "@/hooks/conversation";

const ConversationManager = () => {
  const {
    list,
    create,
    update,
    delete: remove,
    summary,
  } = useConversationManagement({ limit: 20 });

  const handleCreateAndRefresh = async () => {
    const result = await create.createConversation({
      title: "New Conversation",
    });
    // List and summary automatically refresh
  };

  return (
    <div>
      <div>Total Conversations: {summary.summary?.total}</div>
      <button onClick={handleCreateAndRefresh}>Create New</button>

      {list.conversations.map((conv) => (
        <div key={conv.id}>
          <span>{conv.title}</span>
          <button onClick={() => remove.softDeleteConversation(conv.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};
```

## Message Management

### Types

```typescript
// Core types
type Message = Tables<"user_messages">;
type MessageSenderType = Enums<"message_sender_type">; // "BOT" | "USER"

// API request types
interface CreateMessageRequest {
  content: string;
  conversation_id: string;
  sender_type: MessageSenderType;
  meta_data?: any;
}

interface GetMessagesQuery {
  conversation_id?: string;
  sender_type?: MessageSenderType;
  from_date?: string;
  to_date?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
```

### Service Usage

#### Message Operations

```typescript
import { messageService } from "@/lib/services/message.service";

// Get messages for a conversation
const messages = await messageService.getByConversationId("conv_id");

// Create user message
const userMessage = await messageService.addUserMessage(
  "conv_id",
  "Hello, how can you help me?",
  { timestamp: Date.now() }
);

// Create bot response
const botMessage = await messageService.addBotMessage(
  "conv_id",
  "I can help you with various tasks!",
  { model: "gpt-4", tokens: 150 }
);

// Search messages
const searchResults = await messageService.search("help", {
  conversation_id: "conv_id",
  limit: 10,
});

// Get analytics
const summary = await messageService.getSummary();
// Returns: { total: 1250, user_messages: 625, bot_messages: 625, by_conversation: {...} }
```

### Hook Usage

#### Conversation-Specific Messages

```typescript
import {
  useConversationMessages,
  useConversationMessageManagement,
} from "@/hooks/message";

// Display messages for a conversation
const ChatMessages = ({ conversationId }: { conversationId: string }) => {
  const { messages, isLoading, error } =
    useConversationMessages(conversationId);

  if (isLoading) return <div>Loading messages...</div>;

  return (
    <div className="chat-container">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message ${message.sender_type.toLowerCase()}`}
        >
          <div className="content">{message.content}</div>
          <div className="timestamp">
            {new Date(message.created_at).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
};

// Interactive chat interface
const ChatInterface = ({ conversationId }: { conversationId: string }) => {
  const [input, setInput] = useState("");
  const { messages, addUserMessage, addBotMessage, isCreating, createError } =
    useConversationMessageManagement(conversationId);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg = await addUserMessage(input);
    if (userMsg) {
      setInput("");

      // Simulate bot response
      setTimeout(async () => {
        await addBotMessage("I received your message: " + input);
      }, 1000);
    }
  };

  return (
    <div>
      <div className="messages">
        {messages.messages.map((msg) => (
          <div key={msg.id} className={`msg-${msg.sender_type.toLowerCase()}`}>
            {msg.content}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          disabled={isCreating}
        />
        <button onClick={handleSend} disabled={isCreating || !input.trim()}>
          {isCreating ? "Sending..." : "Send"}
        </button>
      </div>

      {createError && <div className="error">{createError}</div>}
    </div>
  );
};
```

#### Global Message Management

```typescript
import { useMessageManagement } from "@/hooks/message";

const MessageAnalytics = () => {
  const { summary } = useMessageManagement();

  return (
    <div>
      <h3>Message Statistics</h3>
      <p>Total Messages: {summary.summary?.total}</p>
      <p>User Messages: {summary.summary?.user_messages}</p>
      <p>Bot Messages: {summary.summary?.bot_messages}</p>
    </div>
  );
};
```

## API Endpoints

### Conversations

- `GET /api/conversations` - List conversations with filtering
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/[id]` - Get single conversation
- `PUT /api/conversations/[id]` - Update conversation
- `DELETE /api/conversations/[id]` - Delete conversation

### Messages

- `GET /api/messages` - List messages with filtering
- `POST /api/messages` - Create new message
- `GET /api/messages/[id]` - Get single message
- `PUT /api/messages/[id]` - Update message
- `DELETE /api/messages/[id]` - Delete message

## Error Handling

### Centralized Error Codes

```typescript
// Added to lib/errors.ts
ErrorCode.CONVERSATION_NOT_FOUND = "CONVERSATION_NOT_FOUND";
ErrorCode.CONVERSATION_TITLE_REQUIRED = "CONVERSATION_TITLE_REQUIRED";
ErrorCode.MESSAGE_NOT_FOUND = "MESSAGE_NOT_FOUND";
ErrorCode.MESSAGE_CONTENT_REQUIRED = "MESSAGE_CONTENT_REQUIRED";
ErrorCode.INVALID_SENDER_TYPE = "INVALID_SENDER_TYPE";
```

### Validation Rules

- **Conversations**: Title required (1-255 chars), soft delete support
- **Messages**: Content required (1-10,000 chars), valid sender type (BOT/USER)
- **Security**: All operations scoped to authenticated user
- **Relationships**: Messages must belong to valid conversation

## Usage Patterns

### Chat Application

```typescript
const ChatApp = () => {
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const { conversations } = useConversationList();

  return (
    <div className="chat-app">
      <div className="conversation-list">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => setSelectedConversation(conv.id)}
            className={selectedConversation === conv.id ? "active" : ""}
          >
            {conv.title}
          </div>
        ))}
      </div>

      <div className="chat-area">
        {selectedConversation ? (
          <ChatInterface conversationId={selectedConversation} />
        ) : (
          <div>Select a conversation to start chatting</div>
        )}
      </div>
    </div>
  );
};
```

### Support Ticket System

```typescript
const SupportTickets = () => {
  const { conversations } = useConversationList({ search: "support" });
  const { summary } = useMessageSummary();

  return (
    <div>
      <h2>Support Tickets ({conversations.length})</h2>
      {conversations.map((ticket) => (
        <SupportTicketCard key={ticket.id} conversation={ticket} />
      ))}
    </div>
  );
};
```

This implementation provides a complete, production-ready CRUD system for user conversations and messages with full TypeScript support, proper error handling, and clean architecture following SOLID principles.
