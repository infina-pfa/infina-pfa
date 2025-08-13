import {
  OnboardingState,
  OnboardingService as OnboardingServiceInterface,
  ComponentResponse,
  UserProfile,
} from "@/lib/types/onboarding.types";
import { apiClient } from "@/lib/api-client";

interface OnboardingChatMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  sender: "user" | "ai" | "system";
  content: string;
  component_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

class OnboardingServiceImpl implements OnboardingServiceInterface {
  async initializeOnboarding(userId: string): Promise<OnboardingState> {
    try {
      // Initialize a new onboarding session
      const response = await apiClient.post<{
        conversationId: string;
        userProfile: UserProfile;
      }>("/onboarding/initialize", { userId });

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to initialize onboarding");
      }

      return {
        step: "ai_welcome",
        userProfile: response.data.userProfile || { name: "" },
        chatMessages: [],
        currentQuestion: null,
        isComplete: false,
        conversationId: response.data.conversationId,
        userId,
      };
    } catch (error) {
      console.error("Failed to initialize onboarding:", error);
      throw new Error("Failed to initialize onboarding. Please try again.");
    }
  }

  async saveUserResponse(
    componentId: string,
    response: ComponentResponse
  ): Promise<void> {
    try {
      const result = await apiClient.post("/onboarding/responses", {
        componentId,
        response,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to save response");
      }
    } catch (error) {
      console.error("Failed to save user response:", error);
      throw new Error("Failed to save your response. Please try again.");
    }
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    try {
      const result = await apiClient.patch("/onboarding/profile", updates);

      if (!result.success) {
        throw new Error(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update user profile:", error);
      throw new Error("Failed to update your profile. Please try again.");
    }
  }

  async completeOnboarding(): Promise<void> {
    try {
      const response = await apiClient.post("/onboarding/complete-v2", {});

      if (!response.success) {
        throw new Error(response.error || "Failed to complete onboarding");
      }
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      throw new Error("Failed to complete onboarding. Please try again.");
    }
  }

  /**
   * Save chat message synchronously (for critical operations)
   */
  async saveChatMessage(
    conversationId: string,
    sender: "user" | "ai" | "system",
    content: string,
    componentId?: string,
    metadata?: Record<string, unknown>,
    customTimestamp?: string
  ): Promise<OnboardingChatMessage> {
    try {
      const response = await apiClient.post<OnboardingChatMessage>(
        "/onboarding/chat-history",
        {
          conversationId,
          sender,
          content,
          componentId,
          metadata,
          customTimestamp,
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to save chat message");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to save chat message:", error);
      throw new Error("Failed to save chat message. Please try again.");
    }
  }

  /**
   * Save chat message asynchronously (fire-and-forget for better UX)
   */
  async saveChatMessageAsync(
    conversationId: string,
    sender: "user" | "ai" | "system",
    content: string,
    componentId?: string,
    metadata?: Record<string, unknown>,
    customTimestamp?: string
  ): Promise<void> {
    try {
      // Dynamic import to avoid circular dependency
      const { chatQueueService } = await import("./chat-queue.service");

      await chatQueueService.enqueueMessage(
        conversationId,
        sender,
        content,
        componentId,
        metadata,
        customTimestamp
      );

      console.log(`📤 Queued ${sender} message for background processing`);
    } catch (error) {
      console.error("Failed to queue chat message:", error);
      // Fallback to synchronous save if queue fails
      try {
        await this.saveChatMessage(
          conversationId,
          sender,
          content,
          componentId,
          metadata,
          customTimestamp
        );
        console.log("✅ Fallback to synchronous save successful");
      } catch (fallbackError) {
        console.error("❌ Both async and sync save failed:", fallbackError);
      }
    }
  }

  /**
   * Get chat queue status for debugging
   */
  async getChatQueueStatus(): Promise<{
    queueSize: number;
    isProcessing: boolean;
    failedMessages: number;
  }> {
    try {
      const { chatQueueService } = await import("./chat-queue.service");
      return chatQueueService.getQueueStatus();
    } catch (error) {
      console.error("Failed to get queue status:", error);
      return {
        queueSize: 0,
        isProcessing: false,
        failedMessages: 0,
      };
    }
  }

  /**
   * Force flush all queued messages (for app exit or critical operations)
   */
  async flushChatQueue(): Promise<void> {
    try {
      const { chatQueueService } = await import("./chat-queue.service");
      await chatQueueService.flush();
      console.log("✅ Chat queue flushed successfully");
    } catch (error) {
      console.error("Failed to flush chat queue:", error);
    }
  }

  async loadChatHistory(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    messages: OnboardingChatMessage[];
    total: number;
  }> {
    try {
      const response = await apiClient.get<{
        messages: OnboardingChatMessage[];
        conversation_id: string;
        total: number;
      }>(
        `/onboarding/chat-history?conversationId=${conversationId}&limit=${limit}&offset=${offset}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to load chat history");
      }

      return {
        messages: response.data.messages,
        total: response.data.total,
      };
    } catch (error) {
      console.error("Failed to load chat history:", error);
      throw new Error("Failed to load chat history. Please try again.");
    }
  }

  async hasExistingChatHistory(conversationId: string): Promise<boolean> {
    try {
      const { messages } = await this.loadChatHistory(conversationId, 1, 0);
      return messages.length > 0;
    } catch (error) {
      console.error("Failed to check existing chat history:", error);
      return false;
    }
  }
}

export const onboardingService = new OnboardingServiceImpl();
