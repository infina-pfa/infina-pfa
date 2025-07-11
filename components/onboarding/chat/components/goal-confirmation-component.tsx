"use client";

import { useState } from "react";
import { OnboardingComponent, ComponentResponse } from "@/lib/types/onboarding.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Target, Calendar, DollarSign } from "lucide-react";

interface GoalConfirmationComponentProps {
  component: OnboardingComponent;
  onResponse: (response: ComponentResponse) => Promise<void>;
}

interface GoalDetails {
  amount: number;
  timeframe: number;
  monthlyTarget: number;
}

export function GoalConfirmationComponent({
  component,
  onResponse,
}: GoalConfirmationComponentProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);
  
  const goalDetails = component.context.goalDetails as GoalDetails;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onResponse({
        goalConfirmed: true,
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Error confirming goal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onResponse({
        goalConfirmed: false,
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Error rejecting goal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-nunito">
      {/* Goal Summary Card */}
      <Card className="p-6 bg-gradient-to-br from-[#0055FF]/5 to-[#0055FF]/10 border-[#0055FF]/20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-[#0055FF] rounded-full flex items-center justify-center mx-auto">
            <Target className="text-white" size={24} />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-[#111827] mb-2">
              {t("emergencyFundGoal")}
            </h3>
            <p className="text-3xl font-bold text-[#0055FF]">
              {goalDetails.amount.toLocaleString()} VND
            </p>
          </div>
        </div>
      </Card>

      {/* Goal Details */}
      <div className="space-y-4">
        <h4 className="font-semibold text-[#111827] text-lg">
          {t("goalBreakdown")}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#2ECC71]/10 rounded-lg flex items-center justify-center">
                <DollarSign className="text-[#2ECC71]" size={20} />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">{t("monthlyTarget")}</p>
                <p className="font-semibold text-[#111827]">
                  {goalDetails.monthlyTarget.toLocaleString()} VND
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#FF9800]/10 rounded-lg flex items-center justify-center">
                <Calendar className="text-[#FF9800]" size={20} />
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">{t("timeToGoal")}</p>
                <p className="font-semibold text-[#111827]">
                  {goalDetails.timeframe} {t("months")}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="space-y-4">
        <h4 className="font-semibold text-[#111827]">
          {t("yourProgressTimeline")}
        </h4>
        
        <div className="space-y-3">
          {Array.from({ length: Math.min(goalDetails.timeframe, 6) }, (_, index) => {
            const month = index + 1;
            const progressAmount = goalDetails.monthlyTarget * month;
            const progressPercentage = (progressAmount / goalDetails.amount) * 100;
            
            return (
              <div key={month} className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 bg-[#0055FF] text-white rounded-full text-sm font-medium">
                  {month}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-[#6B7280]">
                      {t("month")} {month}
                    </span>
                    <span className="text-sm font-medium text-[#111827]">
                      {progressAmount.toLocaleString()} VND
                    </span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                    <div 
                      className="bg-[#0055FF] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>
                {progressPercentage >= 100 && (
                  <CheckCircle className="text-[#2ECC71]" size={20} />
                )}
              </div>
            );
          })}
          
          {goalDetails.timeframe > 6 && (
            <div className="text-center py-2">
              <span className="text-sm text-[#6B7280]">
                ... {t("andMoreMonths", { count: goalDetails.timeframe - 6 })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-[#F6F7F9] p-4 rounded-lg">
        <h4 className="font-medium text-[#111827] mb-3">
          {t("emergencyFundBenefits")}
        </h4>
        <ul className="space-y-2 text-sm text-[#6B7280]">
          <li className="flex items-start space-x-2">
            <CheckCircle className="text-[#2ECC71] flex-shrink-0 mt-0.5" size={16} />
            <span>{t("benefit1")}</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle className="text-[#2ECC71] flex-shrink-0 mt-0.5" size={16} />
            <span>{t("benefit2")}</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle className="text-[#2ECC71] flex-shrink-0 mt-0.5" size={16} />
            <span>{t("benefit3")}</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="flex-1 bg-[#0055FF] text-white hover:bg-[#0055FF]/90 py-3 text-base font-medium"
        >
          {isSubmitting ? t("submitting") : t("confirmGoal")}
        </Button>
        
        <Button
          onClick={handleReject}
          disabled={isSubmitting}
          variant="outline"
          className="flex-1 border-[#0055FF] text-[#0055FF] hover:bg-[#0055FF]/5 py-3 text-base font-medium"
        >
          {t("adjustGoal")}
        </Button>
      </div>
    </div>
  );
} 