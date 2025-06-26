import { apiClient } from "@/lib/api-client";
import {
  Message,
  CreateMessageRequest,
  UpdateMessageRequest,
  GetMessagesQuery,
  MessageSummary,
  MessageWithConversation,
} from "@/lib/types/message.types";

export const messageService = {
  /**
   * Get all messages with optional filtering
   */
  async getAll(query?: GetMessagesQuery): Promise<Message[]> {
    const params: Record<string, string | number> = {};

    if (query?.conversation_id) params.conversation_id = query.conversation_id;
    if (query?.sender_type) params.sender_type = query.sender_type;
    if (query?.from_date) params.from_date = query.from_date;
    if (query?.to_date) params.to_date = query.to_date;
    if (query?.search) params.search = query.search;
    if (query?.limit) params.limit = query.limit;
    if (query?.offset) params.offset = query.offset;

    const result = await apiClient.get<Message[]>(
      "/messages",
      Object.keys(params).length ? params : undefined
    );
    return result.data || [];
  },

  /**
   * Get messages with conversation information
   */
  async getAllWithConversation(query?: GetMessagesQuery): Promise<MessageWithConversation[]> {
    const params: Record<string, string | number> = {};

    if (query?.conversation_id) params.conversation_id = query.conversation_id;
    if (query?.sender_type) params.sender_type = query.sender_type;
    if (query?.from_date) params.from_date = query.from_date;
    if (query?.to_date) params.to_date = query.to_date;
    if (query?.search) params.search = query.search;
    if (query?.limit) params.limit = query.limit;
    if (query?.offset) params.offset = query.offset;
    params.include_conversation = "true";

    const result = await apiClient.get<MessageWithConversation[]>(
      "/messages",
      params
    );
    return result.data || [];
  },

  /**
   * Get messages for a specific conversation
   */
  async getByConversationId(conversationId: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<Message[]> {
    if (!conversationId) throw new Error("Conversation ID is required");

    return this.getAll({
      conversation_id: conversationId,
      limit: options?.limit,
      offset: options?.offset,
    });
  },

  /**
   * Get a single message by ID
   */
  async getById(id: string): Promise<Message | null> {
    if (!id) throw new Error("Message ID is required");

    const result = await apiClient.get<Message>(`/messages/${id}`);
    return result.data || null;
  },

  /**
   * Create a new message
   */
  async create(data: CreateMessageRequest): Promise<Message> {
    // Validate required fields
    if (!data.content?.trim()) {
      throw new Error("Message content is required");
    }

    if (!data.conversation_id) {
      throw new Error("Conversation ID is required");
    }

    if (!data.sender_type) {
      throw new Error("Sender type is required");
    }

    // Validate content length
    if (data.content.length > 10000) {
      throw new Error("Message content cannot exceed 10,000 characters");
    }

    // Validate sender type
    if (!["BOT", "USER"].includes(data.sender_type)) {
      throw new Error("Sender type must be either BOT or USER");
    }

    const result = await apiClient.post<Message>("/messages", data);

    if (!result.data) {
      throw new Error("Failed to create message");
    }

    return result.data;
  },

  /**
   * Update an existing message
   */
  async update(id: string, data: UpdateMessageRequest): Promise<Message> {
    if (!id) throw new Error("Message ID is required");

    // Validate fields if provided
    if (data.content !== undefined && !data.content.trim()) {
      throw new Error("Message content cannot be empty");
    }

    // Validate content length if provided
    if (data.content && data.content.length > 10000) {
      throw new Error("Message content cannot exceed 10,000 characters");
    }

    const result = await apiClient.put<Message>(`/messages/${id}`, data);

    if (!result.data) {
      throw new Error("Failed to update message");
    }

    return result.data;
  },

  /**
   * Delete a message
   */
  async delete(id: string): Promise<void> {
    if (!id) throw new Error("Message ID is required");

    await apiClient.delete(`/messages/${id}`);
  },

  /**
   * Get message summary with analytics
   */
  async getSummary(query?: GetMessagesQuery): Promise<MessageSummary> {
    const messages = await this.getAll(query);

    const summary: MessageSummary = {
      total: messages.length,
      user_messages: 0,
      bot_messages: 0,
      by_conversation: {},
      by_date: {},
    };

    messages.forEach((message) => {
      // Count by sender type
      if (message.sender_type === "USER") {
        summary.user_messages++;
      } else if (message.sender_type === "BOT") {
        summary.bot_messages++;
      }

      // Group by conversation
      const conversationKey = message.conversation_id;
      summary.by_conversation![conversationKey] = 
        (summary.by_conversation![conversationKey] || 0) + 1;

      // Group by date
      const dateKey = new Date(message.created_at).toISOString().split("T")[0]; // YYYY-MM-DD format
      summary.by_date![dateKey] = (summary.by_date![dateKey] || 0) + 1;
    });

    return summary;
  },

  /**
   * Search messages by content
   */
  async search(
    searchTerm: string,
    options?: {
      conversation_id?: string;
      sender_type?: "BOT" | "USER";
      limit?: number;
    }
  ): Promise<Message[]> {
    if (!searchTerm.trim()) {
      throw new Error("Search term is required");
    }

    return this.getAll({
      search: searchTerm,
      conversation_id: options?.conversation_id,
      sender_type: options?.sender_type,
      limit: options?.limit || 50,
    });
  },

  /**
   * Add a user message to a conversation
   */
  async addUserMessage(
    conversationId: string,
    content: string,
    metaData?: Record<string, unknown>
  ): Promise<Message> {
    return this.create({
      conversation_id: conversationId,
      content,
      sender_type: "USER",
      meta_data: metaData || null,
    });
  },

  /**
   * Add a bot message to a conversation
   */
  async addBotMessage(
    conversationId: string,
    content: string,
    metaData?: Record<string, unknown>
  ): Promise<Message> {
    return this.create({
      conversation_id: conversationId,
      content,
      sender_type: "BOT",
      meta_data: metaData || null,
    });
  },
}; 