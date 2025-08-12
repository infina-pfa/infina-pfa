import { apiClient } from "@/lib/api-client";

const DEFAULT_AI_CHAT_MESSAGE =
  "You are a financial advisor. Say hello to the user.";

export const aiService = {
  getStartMessage: async () => {
    const response = await apiClient.get<string>("/ai-advisor/start-message");

    if (!response.data) {
      return DEFAULT_AI_CHAT_MESSAGE;
    }

    return response.data;
  },
};
