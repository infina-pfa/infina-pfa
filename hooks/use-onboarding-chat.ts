import { useState, useEffect, useCallback, useRef } from "react";
import { 
  OnboardingState, 
  OnboardingMessage, 
  ComponentResponse,
  UseOnboardingChatReturn,
  UserProfile,
} from "@/lib/types/onboarding.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { onboardingService } from "@/lib/services/onboarding.service";

export const useOnboardingChat = (
  userId: string,
  onComplete: () => void 
): UseOnboardingChatReturn => {
  const { t } = useAppTranslation(["onboarding", "common"]);
  
  // Core state
  const [state, setState] = useState<OnboardingState>({
    step: "ai_welcome",
    userProfile: { name: "" },
    chatMessages: [],
    currentQuestion: null,
    isComplete: false,
    conversationId: null,
    userId,
  });
  
  const [messages, setMessages] = useState<OnboardingMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref to prevent double initialization in Strict Mode
  const hasInitialized = useRef(false);

  // Initialize onboarding
  useEffect(() => {
    if (userId && !hasInitialized.current) {
      hasInitialized.current = true;
      initializeOnboarding();
    }
  }, [userId]);

  const initializeOnboarding = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const initialState = await onboardingService.initializeOnboarding(userId);
      setState(initialState);
      
      // Start AI conversation with initial welcome ONLY once
      await startOnboardingConversation(initialState);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("initializationFailed");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const startOnboardingConversation = async (initialState: OnboardingState) => {
    console.log("Starting onboarding conversation with state:", initialState);
    
    // Start AI conversation with minimal context for initial welcome
    const startMessage = "start_onboarding";
    
    await streamOnboardingAI({
      message: startMessage,
      conversationHistory: [],
      userProfile: initialState.userProfile,
      currentStep: initialState.step
    });
  };

  const sendMessage = useCallback(async (message: string) => {
    try {
      // Add user message
      const userMessage: OnboardingMessage = {
        id: `user-${Date.now()}`,
        type: "user",
        content: message,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Process the message and get AI response
      await processUserMessage(message);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("messageFailed");
      setError(errorMessage);
    }
  }, [state, messages]);

  const processUserMessage = async (message: string) => {
    // Prepare conversation history - include recent AI and user messages
    const conversationHistory = messages.slice(-8).map(msg => ({
      id: msg.id,
      content: msg.content || "",
      sender: msg.type === "user" ? "user" as const : "ai" as const,
      timestamp: msg.timestamp.toISOString(),
    }));

    // Add current message
    conversationHistory.push({
      id: `current-${Date.now()}`,
      content: message,
      sender: "user" as const,
      timestamp: new Date().toISOString(),
    });

    await streamOnboardingAI({
      message,
      conversationHistory,
      userProfile: state.userProfile,
      currentStep: state.step
    });
  };

  const streamOnboardingAI = async (request: {
    message: string;
    conversationHistory: Array<{
      id: string;
      content: string;
      sender: "user" | "ai";
      timestamp: string;
    }>;
    userProfile: UserProfile;
    currentStep: string;
  }) => {
    try {
      setIsAIThinking(true);
      setIsStreaming(true);
      setError(null);

      const response = await fetch('/api/onboarding/ai-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader');
      }

      const decoder = new TextDecoder();
      let currentAIMessage: OnboardingMessage | null = null;
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsStreaming(false);
              setIsAIThinking(false);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'response_created') {
                // Initialize new AI message
                currentAIMessage = {
                  id: parsed.response_id || `ai-${Date.now()}`,
                  type: "ai",
                  content: "",
                  timestamp: new Date(),
                };
                setMessages(prev => [...prev, currentAIMessage!]);
                fullContent = "";
              } else if (parsed.type === 'response_output_text_streaming') {
                // Update streaming content
                if (currentAIMessage && parsed.response_id === currentAIMessage.id) {
                  fullContent += parsed.content;
                  currentAIMessage.content = fullContent;
                  setMessages(prev => prev.map(msg => 
                    msg.id === currentAIMessage!.id 
                      ? { ...currentAIMessage! }
                      : msg
                  ));
                }
              } else if (parsed.type === 'response_output_text_done') {
                // Finalize text content
                if (currentAIMessage) {
                  currentAIMessage.content = parsed.content;
                  setMessages(prev => prev.map(msg => 
                    msg.id === currentAIMessage!.id 
                      ? { ...currentAIMessage! }
                      : msg
                  ));
                }
              } else if (parsed.type === 'show_component') {
                const { payload } = parsed;
                const componentMessage: OnboardingMessage = {
                  id: payload.componentId,
                  type: 'ai',
                  content: payload.title,
                  timestamp: new Date(),
                  component: {
                    id: payload.componentId,
                    type: payload.componentType,
                    title: payload.title,
                    context: payload.context,
                    isCompleted: false
                  }
                };
                setMessages(prev => [...prev, componentMessage]);
              } else if (parsed.type === 'tool_error') {
                console.error("Tool error from server:", parsed);
                setError(`AI assistant error: ${parsed.error}`);
                const errorMessage: OnboardingMessage = {
                    id: `error-${Date.now()}`,
                    type: 'ai',
                    content: `I encountered an issue. Please try again. (Details: ${parsed.error})`,
                    timestamp: new Date(),
                    isError: true,
                };
                setMessages(prev => [...prev, errorMessage]);
              } else if (parsed.type === 'onboarding_complete') {
                console.log("Onboarding complete signal received from server.");
                onComplete();
                setIsStreaming(false);
                setIsAIThinking(false);
              } else if (parsed.type === 'error') {
                setError(parsed.error);
                const errorMessage: OnboardingMessage = {
                    id: `error-${Date.now()}`,
                    type: 'ai',
                    content: `An unexpected error occurred: ${parsed.error}`,
                    timestamp: new Date(),
                    isError: true,
                };
                setMessages(prev => [...prev, errorMessage]);
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }
    } catch (err) {
      console.error('Streaming error:', err);
      setError(err instanceof Error ? err.message : 'Streaming failed');
    } finally {
      setIsStreaming(false);
      setIsAIThinking(false);
    }
  };

  const handleComponentResponse = useCallback(async (
    componentId: string,
    response: ComponentResponse
  ) => {
    try {
      // Save the response to backend
      await onboardingService.saveUserResponse(componentId, response);
      
      // Update component as completed in UI
      setMessages(prev => prev.map(msg => {
        if (msg.component?.id === componentId) {
          return {
            ...msg,
            component: {
              ...msg.component,
              isCompleted: true,
              response,
            },
          };
        }
        return msg;
      }));

      // Update user profile based on response
      await updateProfileFromResponse(response);
      
      // Continue conversation with AI
      const responseText = getResponseText(response);
      await sendMessage(responseText);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("responseFailed");
      setError(errorMessage);
    }
  }, [state, sendMessage]);

  const updateProfileFromResponse = async (response: ComponentResponse) => {
    const profileUpdates: Partial<UserProfile> = {};

    // Parse different types of responses
    if (response.textValue) {
      // Extract information from text responses
      const text = response.textValue.toLowerCase();
      
      // Extract name
      if (text.includes("tên") || text.includes("name")) {
        const namePatterns = [
          /(?:tên|name)(?:\s+(?:là|is))?(?:\s+tôi)?(?:\s+)?(?:là)?(?:\s+)?([^,.\n,]+)/i,
          /tôi\s+là\s+([^,.\n]+)/i,
          /mình\s+là\s+([^,.\n]+)/i
        ];
        
        for (const pattern of namePatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            profileUpdates.name = match[1].trim();
            break;
          }
        }
      }

      // Extract age
      const ageMatch = text.match(/(\d+)\s*tuổi|age.*?(\d+)|(\d+).*?(?:years?\s+old)/i);
      if (ageMatch) {
        const age = parseInt(ageMatch[1] || ageMatch[2] || ageMatch[3]);
        if (age && age >= 15 && age <= 100) {
          profileUpdates.age = age;
        }
      }

      // Extract income
      const incomeMatch = text.match(/thu\s*nhập.*?(\d+(?:\.\d+)?)\s*(?:triệu|tr)|income.*?(\d+(?:\.\d+)?)\s*(?:million|mil)/i);
      if (incomeMatch) {
        const income = parseFloat(incomeMatch[1] || incomeMatch[2]) * 1000000;
        profileUpdates.income = income;
      }

      // Extract expenses  
      const expenseMatch = text.match(/tiêu.*?(\d+(?:\.\d+)?)\s*(?:triệu|tr)|spend.*?(\d+(?:\.\d+)?)\s*(?:million|mil)/i);
      if (expenseMatch) {
        const expenses = parseFloat(expenseMatch[1] || expenseMatch[2]) * 1000000;
        profileUpdates.expenses = expenses;
      }
    }

    // Handle other response types
    if (response.financialValue) {
      // This would need context about what type of financial input it was
      // For now, we'll need the component to specify the field
    }

    if (response.selectedOption) {
      // Handle goal selection, risk tolerance, etc.
      // This would need component context to know which field to update
    }

    if (Object.keys(profileUpdates).length > 0) {
      await onboardingService.updateUserProfile(profileUpdates);
      
      setState(prev => ({
        ...prev,
        userProfile: { ...prev.userProfile, ...profileUpdates },
      }));
    }
  };

  const getResponseText = (response: ComponentResponse): string => {
    if (response.textValue) {
      return response.textValue;
    } else if (response.selectedOption) {
      return response.selectedOption;
    } else if (response.financialValue) {
      return `${response.financialValue.toLocaleString()} VND`;
    } else if (response.rating) {
      return `${response.rating}/5`;
    } else if (response.sliderValue) {
      return `${response.sliderValue}%`;
    }
    return "ok";
  };

  return {
    state,
    messages,
    isLoading,
    isAIThinking,
    isStreaming,
    error,
    sendMessage,
    handleComponentResponse,
  };
}; 