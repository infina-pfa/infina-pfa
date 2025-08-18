import { apiClient } from "@/lib/api-client";
import { SpeechToTextResponse } from "@/lib/types/chat.types";

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

  speechToText: async (audioFile: File): Promise<SpeechToTextResponse> => {
    const formData = new FormData();
    formData.append("file", audioFile);

    const response = await fetch("/api/ai-advisor/speech-to-text", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Speech to text failed");
    }

    return (await response.json()).data;
  },
};
