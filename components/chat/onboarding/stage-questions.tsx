"use client";

import { useState } from "react";
import { useAppTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface StageQuestionsProps {
  onComplete: (
    answers: Record<string, boolean>,
    determinedStage: string
  ) => void;
}

interface Question {
  id: string;
  textKey: string;
}

export function StageQuestions({ onComplete }: StageQuestionsProps) {
  const { t } = useAppTranslation(["chat", "common"]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions: Question[] = [
    {
      id: "high_interest_debt",
      textKey: "onboarding.debtQuestion",
    },
    {
      id: "emergency_fund",
      textKey: "onboarding.emergencyFundQuestion",
    },
  ];

  const currentQuestion = questions[currentQuestionIndex];

  const determineStage = (allAnswers: Record<string, boolean>): string => {
    const hasHighInterestDebt = allAnswers["high_interest_debt"];
    const hasEmergencyFund = allAnswers["emergency_fund"];

    // Logic from PRD:
    // if Q1 is yes -> debt stage
    // if Q1 no and Q2 no -> no saving stage
    // if Q1 no and Q2 yes -> start investing stage
    if (hasHighInterestDebt) {
      return "debt";
    } else if (!hasEmergencyFund) {
      return "no_saving";
    } else {
      return "start_investing";
    }
  };

  const handleAnswer = async (answer: boolean) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: answer,
    };
    setAnswers(newAnswers);

    // If this is the last question, determine stage and submit
    if (currentQuestionIndex === questions.length - 1) {
      setIsSubmitting(true);
      const determinedStage = determineStage(newAnswers);

      // Small delay for better UX
      setTimeout(() => {
        onComplete(newAnswers, determinedStage);
        setIsSubmitting(false);
      }, 500);
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-2">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index <= currentQuestionIndex ? "bg-[#0055FF]" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Question display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 bg-white border-none shadow-sm">
            <div className="space-y-4">
              <div className="text-sm text-gray-500 font-nunito font-medium">
                {t("question", { ns: "common" })} {currentQuestionIndex + 1}{" "}
                {t("of", { ns: "common" })} {questions.length}
              </div>

              <h3 className="text-lg font-nunito font-semibold text-gray-900 leading-relaxed">
                {t(currentQuestion.textKey)}
              </h3>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => handleAnswer(true)}
                  disabled={isSubmitting}
                  className="flex-1 h-12 bg-[#0055FF] hover:bg-blue-700 text-white font-nunito font-medium rounded-xl border-none shadow-none transition-all duration-200"
                >
                  {t("onboarding.yes")}
                </Button>

                <Button
                  onClick={() => handleAnswer(false)}
                  disabled={isSubmitting}
                  variant="outline"
                  className="flex-1 h-12 border-2 border-gray-200 hover:border-[#0055FF] hover:bg-[#0055FF] hover:text-white text-gray-700 font-nunito font-medium rounded-xl shadow-none transition-all duration-200"
                >
                  {t("onboarding.no")}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Loading indicator when submitting */}
      {isSubmitting && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-2 text-[#0055FF]"
        >
          <div className="w-5 h-5 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
          <span className="font-nunito font-medium">
            {t("analyzing", { ns: "common" })}...
          </span>
        </motion.div>
      )}
    </div>
  );
}
