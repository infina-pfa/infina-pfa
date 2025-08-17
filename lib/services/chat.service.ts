import {
  AdvisorStreamRequest,
  ChatMessage,
  Conversation,
  CreateConversationResponse,
  MessageSender,
  MessageType,
  UploadImageResponse,
} from "@/lib/types/chat.types";
import { Json } from "../supabase/database";
import { apiClient } from "../api/api-client";

export const chatService = {
  /**
   * Create a new conversation
   */
  async createConversation(title?: string): Promise<Conversation> {
    const response = await apiClient.post<CreateConversationResponse>(
      "/conversations",
      {
        title: title || `Chat Session - ${new Date().toLocaleString()}`,
      }
    );

    if (response.data.status !== 201 || !response.data.data) {
      throw new Error(response.data.error || "Failed to create conversation");
    }

    return response.data.data;
  },

  /**
   * Send a user message to a conversation
   */
  async sendUserMessage(
    content: string,
    conversationId: string,
    options?: { sender?: MessageSender }
  ): Promise<ChatMessage> {
    if (!content.trim()) {
      throw new Error("Message content cannot be empty");
    }

    if (content.length > 10000) {
      throw new Error("Message content cannot exceed 10,000 characters");
    }

    const requestData = {
      content: content.trim(),
      sender: options?.sender || ("user" as MessageSender),
      type: "text" as MessageType,
    };

    const response = await apiClient.post(
      `/conversations/${conversationId}/messages`,
      requestData
    );

    if (response.data.status !== 201 || !response.data.data) {
      throw new Error(response.data.error || "Failed to send message");
    }

    // Transform the message to include client-side properties
    const userMessage: ChatMessage = {
      ...response.data.data,
      isStreaming: false,
      component: null,
    };

    return userMessage;
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
    const requestData: {
      content: string;
      type: MessageType;
      sender: MessageSender;
      metadata?: Json;
    } = message;

    const response = await apiClient.post(
      `/conversations/${message.conversation_id}/messages`,
      requestData
    );

    if (response.data.status !== 201 || !response.data.data) {
      throw new Error(response.data.error || "Failed to save AI message");
    }

    return {
      ...response.data.data,
      isStreaming: false,
      component: null,
    };
  },

  /**
   * Start AI advisor streaming response
   */
  async startAIAdvisorStream(
    conversationId: string,
    userMessage: string,
    sender: MessageSender
  ): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch(
      `/api/conversations/${conversationId}/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: userMessage, sender }),
      }
    );

    if (!response.ok) {
      throw new Error(`AI advisor request failed: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body from AI advisor");
    }

    return response.body;
  },

  /**
   * Start AI advisor tool streaming response
   */
  async startAIAdvisorToolStream(
    request: AdvisorStreamRequest
  ): Promise<ReadableStream<Uint8Array>> {
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
  },

  /**
   * Upload an image to a conversation
   */
  async uploadImage(
    conversationId: string,
    file: File
  ): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `/api/conversations/${conversationId}/upload-image`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload image");
    }

    return response.json();
  },
};
