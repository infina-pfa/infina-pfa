"use client";

import { useState, useRef, useEffect } from "react";
import { useAppTranslation } from "@/hooks/use-translation";
import { StageQuestions } from "./stage-questions";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "../message-bubble";
import { TypingIndicator } from "../typing-indicator";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "@/lib/types/chat.types";

interface StageIdentificationFlowProps {
  onComplete: (stage: string) => void;
}

type FlowStep = "welcome" | "intro" | "questions" | "confirmation";

export function StageIdentificationFlow({
  onComplete,
}: StageIdentificationFlowProps) {
  const { t } = useAppTranslation(["chat", "common"]);
  const [currentStep, setCurrentStep] = useState<FlowStep>("welcome");
  const [determinedStage, setDeterminedStage] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: "welcome-1",
      content: t("onboarding.welcomeMessage"),
      sender: "ai",
      type: "text",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      conversation_id: "onboarding-temp",
      user_id: "temp-user",
      metadata: null,
    };
    setMessages([welcomeMessage]);
  }, [t]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const getStageConfirmationKey = (stage: string): string => {
    switch (stage) {
      case "debt":
        return "onboarding.debtStageConfirmation";
      case "no_saving":
        return "onboarding.noSavingStageConfirmation";
      case "start_investing":
        return "onboarding.investingStageConfirmation";
      default:
        return "onboarding.noSavingStageConfirmation";
    }
  };

  const addMessage = (content: string, sender: "ai" | "user" = "ai") => {
    const message: ChatMessage = {
      id: `${sender}-${Date.now()}`,
      content,
      sender,
      type: "text",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      conversation_id: "onboarding-temp",
      user_id: "temp-user",
      metadata: null,
    };
    setMessages((prev) => [...prev, message]);
  };

  const handleStartQuestions = () => {
    setCurrentStep("intro");
    // Add the questions intro message
    addMessage(t("onboarding.questionsIntro"));
  };

  const handleProceedToQuestions = () => {
    setCurrentStep("questions");
  };

  const handleQuestionsComplete = async (
    userAnswers: Record<string, boolean>,
    stage: string
  ) => {
    setDeterminedStage(stage);
    setCurrentStep("confirmation");

    try {
      // Create/update user profile with onboarding completion
      const profileResponse = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          onboarding_completed_at: new Date().toISOString(),
          financial_stage: stage,
        }),
      });

      if (!profileResponse.ok) {
        console.error("Failed to update user profile");
      }

      console.log("✅ Onboarding data saved successfully:", {
        stage,
        answers: userAnswers,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Failed to save onboarding data:", error);
      // Continue with UI flow even if save fails
    }

    // Add confirmation message
    const confirmationKey = getStageConfirmationKey(stage);
    addMessage(t(confirmationKey));
    addMessage(t("onboarding.analysisComplete"));
  };

  const handleFinalConfirmation = async () => {
    if (!determinedStage) return;

    setIsCompleting(true);

    try {
      // Small delay for better UX (data already saved in handleQuestionsComplete)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Complete the onboarding flow
      onComplete(determinedStage);
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      onComplete(determinedStage);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="flex h-full bg-gray-50 p-0 md:p-8">
      <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-6 space-y-6">
            {/* Display all messages using MessageBubble */}
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Questions Component */}
            <AnimatePresence>
              {currentStep === "questions" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="flex justify-start mb-6"
                >
                  <div className="max-w-[80%] w-full">
                    <StageQuestions onComplete={handleQuestionsComplete} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Thinking indicator */}
            {isThinking && <TypingIndicator />}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Action Area */}
        <div className="px-4 md:px-0 py-4">
          <AnimatePresence mode="wait">
            {currentStep === "welcome" && (
              <motion.div
                key="welcome-action"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center"
              >
                <Button
                  onClick={handleStartQuestions}
                  className="px-8 py-3 bg-[#0055FF] hover:bg-blue-700 text-white font-nunito font-medium rounded-xl border-none shadow-none transition-all duration-200"
                >
                  {t("onboarding.getStarted")}
                </Button>
              </motion.div>
            )}

            {currentStep === "intro" && (
              <motion.div
                key="intro-action"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center"
              >
                <Button
                  onClick={handleProceedToQuestions}
                  className="px-8 py-3 bg-[#0055FF] hover:bg-blue-700 text-white font-nunito font-medium rounded-xl border-none shadow-none transition-all duration-200"
                >
                  {t("onboarding.continue")}
                </Button>
              </motion.div>
            )}

            {currentStep === "confirmation" && (
              <motion.div
                key="confirmation-action"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center"
              >
                <Button
                  onClick={handleFinalConfirmation}
                  disabled={isCompleting}
                  className="px-8 py-3 bg-[#2ECC71] hover:bg-green-600 text-white font-nunito font-medium rounded-xl border-none shadow-none transition-all duration-200 disabled:opacity-50"
                >
                  {isCompleting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t("common.loading")}</span>
                    </div>
                  ) : (
                    t("getStarted", { ns: "common" })
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
