import { apiClient } from "@/lib/api-client";
import {
  Conversation,
  CreateConversationRequest,
  UpdateConversationRequest,
  GetConversationsQuery,
  ConversationSummary,
  ConversationWithStats,
} from "@/lib/types/conversation.types";

export const conversationService = {
  /**
   * Get all conversations with optional filtering
   */
  async getAll(query?: GetConversationsQuery): Promise<Conversation[]> {
    const params: Record<string, string | number> = {};

    if (query?.include_deleted !== undefined) {
      params.include_deleted = query.include_deleted.toString();
    }
    if (query?.search) params.search = query.search;
    if (query?.limit) params.limit = query.limit;
    if (query?.offset) params.offset = query.offset;

    const result = await apiClient.get<Conversation[]>(
      "/conversations",
      Object.keys(params).length ? params : undefined
    );
    return result.data || [];
  },

  /**
   * Get conversations with message statistics
   */
  async getAllWithStats(query?: GetConversationsQuery): Promise<ConversationWithStats[]> {
    const params: Record<string, string | number> = {};

    if (query?.include_deleted !== undefined) {
      params.include_deleted = query.include_deleted.toString();
    }
    if (query?.search) params.search = query.search;
    if (query?.limit) params.limit = query.limit;
    if (query?.offset) params.offset = query.offset;
    params.include_stats = "true";

    const result = await apiClient.get<ConversationWithStats[]>(
      "/conversations",
      params
    );
    return result.data || [];
  },

  /**
   * Get a single conversation by ID
   */
  async getById(id: string): Promise<Conversation | null> {
    if (!id) throw new Error("Conversation ID is required");

    const result = await apiClient.get<Conversation>(`/conversations/${id}`);
    return result.data || null;
  },

  /**
   * Create a new conversation
   */
  async create(data: CreateConversationRequest): Promise<Conversation> {
    // Validate required fields
    if (!data.title?.trim()) {
      throw new Error("Conversation title is required");
    }

    // Validate title length
    if (data.title.length > 255) {
      throw new Error("Title cannot exceed 255 characters");
    }

    const result = await apiClient.post<Conversation>("/conversations", data);

    if (!result.data) {
      throw new Error("Failed to create conversation");
    }

    return result.data;
  },

  /**
   * Update an existing conversation
   */
  async update(id: string, data: UpdateConversationRequest): Promise<Conversation> {
    if (!id) throw new Error("Conversation ID is required");

    // Validate fields if provided
    if (data.title !== undefined && !data.title.trim()) {
      throw new Error("Conversation title cannot be empty");
    }

    // Validate title length if provided
    if (data.title && data.title.length > 255) {
      throw new Error("Title cannot exceed 255 characters");
    }

    const result = await apiClient.put<Conversation>(`/conversations/${id}`, data);

    if (!result.data) {
      throw new Error("Failed to update conversation");
    }

    return result.data;
  },

  /**
   * Soft delete a conversation (set deleted_at)
   */
  async softDelete(id: string): Promise<Conversation> {
    if (!id) throw new Error("Conversation ID is required");

    const result = await apiClient.put<Conversation>(`/conversations/${id}`, {
      deleted_at: new Date().toISOString(),
    });

    if (!result.data) {
      throw new Error("Failed to delete conversation");
    }

    return result.data;
  },

  /**
   * Restore a soft-deleted conversation
   */
  async restore(id: string): Promise<Conversation> {
    if (!id) throw new Error("Conversation ID is required");

    const result = await apiClient.put<Conversation>(`/conversations/${id}`, {
      deleted_at: null,
    });

    if (!result.data) {
      throw new Error("Failed to restore conversation");
    }

    return result.data;
  },

  /**
   * Hard delete a conversation
   */
  async delete(id: string): Promise<void> {
    if (!id) throw new Error("Conversation ID is required");

    await apiClient.delete(`/conversations/${id}`);
  },

  /**
   * Get conversation summary with statistics
   */
  async getSummary(query?: GetConversationsQuery): Promise<ConversationSummary> {
    const conversations = await this.getAll({
      ...query,
      include_deleted: true, // Get all to calculate totals
    });

    const summary: ConversationSummary = {
      total: conversations.length,
      active: 0,
      deleted: 0,
      recent_count: 0,
    };

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    conversations.forEach((conversation) => {
      if (conversation.deleted_at) {
        summary.deleted++;
      } else {
        summary.active++;
      }

      // Count recent conversations (last 7 days)
      const createdAt = new Date(conversation.created_at);
      if (createdAt >= oneWeekAgo) {
        summary.recent_count!++;
      }
    });

    return summary;
  },

  /**
   * Search conversations by title
   */
  async search(searchTerm: string, options?: { limit?: number }): Promise<Conversation[]> {
    if (!searchTerm.trim()) {
      throw new Error("Search term is required");
    }

    return this.getAll({
      search: searchTerm,
      limit: options?.limit || 20,
      include_deleted: false,
    });
  },
}; 