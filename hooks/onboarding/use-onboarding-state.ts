import { useState, useRef } from "react";
import {
  OnboardingState,
  OnboardingMessage,
  UserProfile,
} from "@/lib/types/onboarding.types";

interface UseOnboardingStateReturn {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
  messages: OnboardingMessage[];
  setMessages: React.Dispatch<React.SetStateAction<OnboardingMessage[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isAIThinking: boolean;
  setIsAIThinking: React.Dispatch<React.SetStateAction<boolean>>;
  isStreaming: boolean;
  setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  hasStartedAI: boolean;
  setHasStartedAI: React.Dispatch<React.SetStateAction<boolean>>;
  hasInitialHistorySaved: boolean;
  setHasInitialHistorySaved: React.Dispatch<React.SetStateAction<boolean>>;
  hasInitialized: React.MutableRefObject<boolean>;
}

export const useOnboardingState = (userId: string): UseOnboardingStateReturn => {
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

  // UI state
  const [messages, setMessages] = useState<OnboardingMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Flow control state
  const [hasStartedAI, setHasStartedAI] = useState(false);
  const [hasInitialHistorySaved, setHasInitialHistorySaved] = useState(false);
  
  // Ref to prevent double initialization in Strict Mode
  const hasInitialized = useRef(false);

  return {
    state,
    setState,
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    isAIThinking,
    setIsAIThinking,
    isStreaming,
    setIsStreaming,
    error,
    setError,
    hasStartedAI,
    setHasStartedAI,
    hasInitialHistorySaved,
    setHasInitialHistorySaved,
    hasInitialized,
  };
};