"use client";

import { useState } from "react";
import { OnboardingComponent, ComponentResponse } from "@/lib/types/onboarding.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DecisionTreeComponentProps {
  component: OnboardingComponent;
  onResponse: (response: ComponentResponse) => Promise<void>;
}

interface DecisionTreeQuestion {
  id: string;
  question: string;
  explanation?: string;
  yesLabel?: string;
  noLabel?: string;
}

export function DecisionTreeComponent({
  component,
  onResponse,
}: DecisionTreeComponentProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = (component.context.questions || []) as DecisionTreeQuestion[];
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answer: boolean) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: answer
    };
    setAnswers(newAnswers);

    // If this is the last question, determine stage and submit
    if (currentQuestionIndex === questions.length - 1) {
      const determinedStage = determineStage(newAnswers);
      handleSubmit(newAnswers, determinedStage);
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const determineStage = (allAnswers: Record<string, boolean>): string => {
    // Question 1: Do you have high-interest debt (>8%)?
    // Question 2: Do you have 3+ months emergency fund?
    
    const hasHighInterestDebt = allAnswers["high_interest_debt"];
    const hasEmergencyFund = allAnswers["emergency_fund"];

    if (hasHighInterestDebt) {
      return "debt"; // GET OUT OF DEBT
    } else if (!hasEmergencyFund) {
      return "start_saving"; // START SAVING FOR EMERGENCY FUND
    } else {
      return "start_investing"; // START INVESTING
    }
  };

  const handleSubmit = async (allAnswers: Record<string, boolean>, determinedStage: string) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onResponse({
        answers: allAnswers,
        determinedStage,
        reasoning: getStageReasoning(allAnswers, determinedStage),
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Error submitting decision tree answers:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStageReasoning = (allAnswers: Record<string, boolean>, stage: string): string => {
    const hasHighInterestDebt = allAnswers["high_interest_debt"];
    const hasEmergencyFund = allAnswers["emergency_fund"];

    if (stage === "debt") {
      return t("debtStageReasoning", { hasHighInterestDebt });
    } else if (stage === "start_saving") {
      return t("savingStageReasoning", { hasEmergencyFund });
    } else {
      return t("investingStageReasoning", { hasHighInterestDebt, hasEmergencyFund });
    }
  };

  const getProgressWidth = () => {
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  if (!currentQuestion) {
    return <div>Loading questions...</div>;
  }

  return (
    <div className="space-y-6 font-nunito">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-[#6B7280]">
          <span>{t("questionNumber")} {currentQuestionIndex + 1} {t("ofTotal")} {questions.length}</span>
          <span>{Math.round(getProgressWidth())}%</span>
        </div>
        <div className="w-full bg-[#F0F2F5] rounded-full h-2">
          <div 
            className="bg-[#0055FF] h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressWidth()}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="p-6 border-[#E0E0E0] bg-white">
        <div className="space-y-4">
          <h3 className="font-semibold text-[#111827] text-lg leading-relaxed">
            {currentQuestion.question}
          </h3>
          
          {currentQuestion.explanation && (
            <p className="text-[#6B7280] text-sm leading-relaxed">
              {currentQuestion.explanation}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              onClick={() => handleAnswer(true)}
              disabled={isSubmitting}
              className="h-12 bg-[#2ECC71] hover:bg-[#2ECC71]/90 text-white font-medium transition-colors duration-200"
            >
              {currentQuestion.yesLabel || t("yesAnswer")}
            </Button>
            
            <Button
              onClick={() => handleAnswer(false)}
              disabled={isSubmitting}
              variant="outline"
              className="h-12 border-[#E0E0E0] text-[#111827] hover:bg-[#F6F7F9] font-medium transition-colors duration-200"
            >
              {currentQuestion.noLabel || t("noAnswer")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Previous answers summary (for questions after the first) */}
      {currentQuestionIndex > 0 && (
        <Card className="p-4 border-[#E0E0E0] bg-[#F6F7F9]">
          <div className="space-y-2">
            <h4 className="font-medium text-[#111827] text-sm">
              {t("previousAnswers")}:
            </h4>
            {questions.slice(0, currentQuestionIndex).map((q, index) => (
              <div key={q.id} className="flex justify-between text-sm">
                <span className="text-[#6B7280]">{t("questionNumber")} {index + 1}:</span>
                <span className="text-[#111827] font-medium">
                  {answers[q.id] ? (q.yesLabel || t("yesAnswer")) : (q.noLabel || t("noAnswer"))}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
} 