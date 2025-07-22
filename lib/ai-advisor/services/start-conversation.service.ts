import { apiClient } from "@/lib/api-client";

export class StartConversationService {
  /**
   * Gets the first message for the conversation based on user's financial status and budgeting style
   * This calls the start-message API route which determines the appropriate message
   * based on the current date, user's financial data, and budgeting style
   */
  async getFirstMessage(): Promise<string> {
    try {
      // Call the start-message API route
      const response = await apiClient.get<{ startMessage: string }>(
        "/start-message"
      );

      // Return the start message from the response
      return response.data?.startMessage || this.getFallbackMessage();
    } catch (error) {
      console.error("Error fetching start message:", error);
      // Return a fallback message in case of an error
      return this.getFallbackMessage();
    }
  }

  /**
   * Provides a fallback message in case the API call fails
   */
  private getFallbackMessage(): string {
    return `
      I'm the system, please start the conversation with user by doing actions:
      1. Deliver a greeting and welcome the user.
      2. Ask how you can help them with their financial goals today.
    `;
  }
}

export const startConversationService = new StartConversationService();
