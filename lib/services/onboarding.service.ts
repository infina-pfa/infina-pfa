import { apiClient } from "../api/api-client";

export interface OnboardingProfile {
  id: string;
  userId: string;
  expense: number;
  income: number;
  pyfAmount: number;
  budgetingStyle: string;
  metadata: Record<string, unknown>;
  completedAt: string | null;
}

export interface OnboardingMessage {
  id: string;
  userId: string;
  sender: string;
  content: string;
  componentId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export const onboardingService = {
  getMessages: async (): Promise<OnboardingMessage[]> => {
    const response = await apiClient.get("/onboarding/messages");

    return response.data.data;
  },

  updateUserProfile: async (
    updates: Partial<OnboardingProfile>
  ): Promise<void> => {
    const response = await apiClient.patch("/onboarding/profile", updates);
    if (!response.data) {
      throw new Error("Failed to update profile");
    }
  },

  getOnboardingProfile: async (): Promise<OnboardingProfile> => {
    const response = await apiClient.get<{ data: OnboardingProfile }>(
      "/onboarding/profile-v2"
    );

    return response.data.data;
  },

  completeOnboarding: async () => {
    const response = await apiClient.post("/onboarding/complete-v2", {});

    return response.data;
  },

  saveMessage: async (body: {
    message: string;
    sender: "user" | "ai";
    component_id?: string;
    metadata?: Record<string, unknown>;
  }) => {
    const response = await apiClient.post("/onboarding/messages", body);

    return response.data;
  },

  streamMessage: async (body: { message: string }) => {
    const response = await fetch("/api/onboarding/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    return response.body;
  },

  streamFirstMessages: async () => {
    const response = await fetch("/api/onboarding/stream-first-messages");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    return response.body;
  },

  startOver: async (): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.post("/onboarding/start-over", {});
    return response.data;
  },
};
