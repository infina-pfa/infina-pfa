import { 
  OnboardingState, 
  OnboardingService as OnboardingServiceInterface,
  ComponentResponse,
  UserProfile,
  FinancialStage
} from "@/lib/types/onboarding.types";
import { apiClient } from "@/lib/api-client";

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

  async saveUserResponse(componentId: string, response: ComponentResponse): Promise<void> {
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

  async analyzeFinancialStage(profile: UserProfile): Promise<{
    stage: FinancialStage;
    confidence: number;
    reasoning: string;
  }> {
    try {
      const response = await apiClient.post<{
        stage: FinancialStage;
        confidence: number;
        reasoning: string;
      }>("/onboarding/analyze-stage", { profile });

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to analyze stage");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to analyze financial stage:", error);
      throw new Error("Failed to analyze your financial stage. Please try again.");
    }
  }

  async completeOnboarding(finalProfile: UserProfile): Promise<void> {
    try {
      const response = await apiClient.post("/onboarding/complete", { 
        profile: finalProfile 
      });
      
      if (!response.success) {
        throw new Error(response.error || "Failed to complete onboarding");
      }
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      throw new Error("Failed to complete onboarding. Please try again.");
    }
  }
}

export const onboardingService = new OnboardingServiceImpl(); 