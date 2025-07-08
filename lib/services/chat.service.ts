import { handleError } from "@/lib/error-handler";
import {
  AdvisorStreamRequest,
  ChatMessage,
  Conversation,
  CreateConversationResponse,
  MessageSender,
  MessageType,
} from "@/lib/types/chat.types";
import { Json } from "../supabase/database";

export const chatService = {
  /**
   * Create a new conversation
   */
  async createConversation(title?: string): Promise<Conversation> {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title || `Chat Session - ${new Date().toLocaleString()}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CreateConversationResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || "Failed to create conversation");
      }

      return data.data;
    } catch (error) {
      const appError = handleError(error);
      throw new Error(appError.message);
    }
  },

  /**
   * Send a user message to a conversation
   */
  async sendUserMessage(
    content: string,
    conversationId: string
  ): Promise<ChatMessage> {
    try {
      if (!content.trim()) {
        throw new Error("Message content cannot be empty");
      }

      if (content.length > 10000) {
        throw new Error("Message content cannot exceed 10,000 characters");
      }

      const requestData = {
        content: content.trim(),
        conversation_id: conversationId,
        sender: "user" as MessageSender,
        type: "text" as MessageType,
      };

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || "Failed to send message");
      }

      // Transform the message to include client-side properties
      const userMessage: ChatMessage = {
        ...data.data,
        isStreaming: false,
        component: null,
      };

      return userMessage;
    } catch (error) {
      const appError = handleError(error);
      throw new Error(appError.message);
    }
  },

  /**
   * Save an AI message to the database
   */
  async saveAIMessage(message: {
    content: string;
    conversation_id: string;
    type: MessageType;
    sender: MessageSender;
    metadata?: Json | null;
  }): Promise<ChatMessage> {
    try {
      const requestData: {
        content: string;
        conversation_id: string;
        type: MessageType;
        sender: MessageSender;
        metadata?: Json;
      } = message;

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || "Failed to save AI message");
      }

      return {
        ...data.data,
        isStreaming: false,
        component: null,
      };
    } catch (error) {
      const appError = handleError(error);
      throw new Error(appError.message);
    }
  },

  /**
   * Start AI advisor streaming response
   */
  async startAIAdvisorStream(
    request: AdvisorStreamRequest
  ): Promise<ReadableStream<Uint8Array>> {
    try {
      const response = await fetch("/api/chat/advisor-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`AI advisor request failed: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body from AI advisor");
      }

      return response.body;
    } catch (error) {
      const appError = handleError(error);
      throw new Error(appError.message);
    }
  },

  /**
   * Start AI advisor streaming response
   */
  async startAIAdvisorToolStream(
    request: AdvisorStreamRequest
  ): Promise<ReadableStream<Uint8Array>> {
    try {
      const response = await fetch("/api/chat/advisor-tool-interact-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`AI advisor request failed: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body from AI advisor");
      }

      return response.body;
    } catch (error) {
      const appError = handleError(error);
      throw new Error(appError.message);
    }
  },
};
