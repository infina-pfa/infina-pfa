import { 
  Conversation, 
  Message,
  ChatContext,
  CreateSessionResponse,
  SendMessageServiceResponse,
  CreateConversationResponse,
  SendMessageResponse
} from "@/lib/types/chat.types";
import { handleChatError } from "@/lib/chat-error-handler";

class ChatService {
  /**
   * Create a new chat session (conversation)
   */
  async createSession(userName: string): Promise<CreateSessionResponse> {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Chat Session - ${new Date().toLocaleString()}`
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CreateConversationResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || "Failed to create conversation");
      }

      // Create welcome message via API
      const welcomeResponse = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: `Hi, ${userName}! I'm your AI financial advisor. How can I help you today?`,
          conversation_id: data.data.id,
          sender_type: "BOT"
        }),
      });

      if (!welcomeResponse.ok) {
        throw new Error("Failed to create welcome message");
      }

      const welcomeData = await welcomeResponse.json();

      if (!welcomeData.success || !welcomeData.data) {
        throw new Error("Failed to create welcome message");
      }

      return {
        success: true,
        data: {
          conversation: data.data,
          welcomeMessage: welcomeData.data
        }
      };

    } catch (error) {
      const chatError = handleChatError(error);
      return {
        success: false,
        error: chatError
      };
    }
  }

  /**
   * Get conversation messages
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const response = await fetch(`/api/messages?conversation_id=${conversationId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch messages");
      }

      return data.data || [];

    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  }

  /**
   * Send a user message
   */
  async sendMessage(
    content: string,
    conversationId: string,
    metadata?: Record<string, unknown>
  ): Promise<SendMessageServiceResponse> {
    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          conversationId,
          type: "text",
          metadata
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SendMessageResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || "Failed to send message");
      }

      return {
        success: true,
        data: {
          userMessage: data.data.userMessage,
          streamUrl: `/api/chat/stream?conversationId=${conversationId}&messageId=${data.data.userMessage.id}`
        }
      };

    } catch (error) {
      const chatError = handleChatError(error);
      return {
        success: false,
        error: chatError
      };
    }
  }

  /**
   * Get user context for AI
   */
  async getUserContext(userId: string): Promise<ChatContext> {
    try {
      // Get user profile via API (we'll need to create these endpoints)
      const userResponse = await fetch(`/api/users/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      let userName = "User";
      let userProfile;

      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.success && userData.data) {
          userName = userData.data.name || "User";
          userProfile = {
            totalAssetValue: userData.data.total_asset_value || 0,
            recentTransactions: [],
            budgets: [],
            goals: []
          };
        }
      }

      // TODO: Implement additional API calls for transactions, budgets, goals
      // when those endpoints are ready

      const context: ChatContext = {
        userId,
        userName,
        userProfile,
        conversationHistory: []
      };

      return context;

    } catch (error) {
      console.error("Error getting user context:", error);
      // Return minimal context on error
      return {
        userId,
        userName: "User",
        conversationHistory: []
      };
    }
  }

  /**
   * Delete conversation via API
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success || false;

    } catch (error) {
      console.error("Error deleting conversation:", error);
      return false;
    }
  }

  /**
   * Get conversation by ID via API
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        return null;
      }

      return data.data;

    } catch (error) {
      console.error("Error fetching conversation:", error);
      return null;
    }
  }

  /**
   * Validate user access to conversation via API
   */
  async validateConversationAccess(conversationId: string): Promise<boolean> {
    try {
      const conversation = await this.getConversation(conversationId);
      return !!conversation;
    } catch (error) {
      console.error("Error validating conversation access:", error);
      return false;
    }
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch("/api/health", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Service health check failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService; 