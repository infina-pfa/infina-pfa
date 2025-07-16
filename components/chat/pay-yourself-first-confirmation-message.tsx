"use client";

import { useState } from "react";
import { useAppTranslation } from "@/hooks/use-translation";
import { usePayYourselfFirstSWR } from "@/hooks/swr/use-pay-yourself-first";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MoneyInput } from "@/components/ui/money-input";
import { formatVND } from "@/lib/validation/input-validation";
import { apiClient } from "@/lib/api-client";
import { handleError } from "@/lib/error-handler";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Target, 
  Brain,
  DollarSign 
} from "lucide-react";

interface PayYourselfFirstConfirmationMessageProps {
  onSendMessage?: (message: string) => void;
}

export const PayYourselfFirstConfirmationMessage = ({ 
  onSendMessage 
}: PayYourselfFirstConfirmationMessageProps) => {
  const { t } = useAppTranslation(["goals", "common"]);
  const { data, loading, error, refetch } = usePayYourselfFirstSWR();
  
  const [userAmount, setUserAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 max-w-lg">
        <Skeleton className="h-6 w-64 mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 max-w-lg">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { 
    recommendedAmount, 
    minRecommendedAmount, 
    maxRecommendedAmount,
    emergencyFundGoal, 
    aiRecommendation 
  } = data;

  const handleConfirmTransfer = async () => {
    if (!userAmount || parseFloat(userAmount) <= 0) {
      setSubmitError("Please enter a valid amount");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const response = await apiClient.post("/goals/emergency-fund/pay-yourself-first", {
        amount: parseFloat(userAmount),
        status: "completed",
      });

      if (response.success) {
        setSuccessMessage(t("contributionRecorded"));
        await refetch();
        
        // Trigger AI follow-up message
        if (onSendMessage) {
          onSendMessage(`I've successfully transferred ${formatVND(parseFloat(userAmount))} to my emergency fund`);
        }
      } else {
        throw new Error(response.error || "Failed to record contribution");
      }
    } catch (error) {
      const appError = handleError(error);
      setSubmitError(appError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotTransferred = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const response = await apiClient.post("/goals/emergency-fund/pay-yourself-first", {
        amount: 0,
        status: "postponed",
      });

      if (response.success) {
        setSuccessMessage("No worries! We'll remind you again next month.");
        await refetch();
        
        if (onSendMessage) {
          onSendMessage("I haven't made my emergency fund contribution yet this month");
        }
      } else {
        throw new Error(response.error || "Failed to record status");
      }
    } catch (error) {
      const appError = handleError(error);
      setSubmitError(appError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemindLater = () => {
    if (onSendMessage) {
      onSendMessage("Please remind me about my emergency fund contribution later");
    }
  };

  const handleQuickAmount = (amount: number) => {
    setUserAmount(amount.toString());
  };

  // Get confidence level colors
  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Show success state
  if (successMessage) {
    return (
      <div className="bg-white rounded-lg p-6 max-w-lg">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("contributionRecorded")}
          </h3>
          <p className="text-sm text-gray-600 mb-4">{successMessage}</p>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700">{t("keepUpGoodWork")}</p>
            <p className="text-xs text-green-600 mt-1">{t("everyContributionCounts")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 max-w-lg">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
          {t("payYourselfFirstTitle")}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {t("payYourselfFirstDescription")}
        </p>
      </div>

      {/* Goal Progress Info */}
      {emergencyFundGoal && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-blue-900 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              {t("goalProgressInfo")}
            </h4>
            {aiRecommendation.monthsToComplete > 0 && (
              <span className="text-xs text-blue-600">
                {t("monthsToDeadline", { count: aiRecommendation.monthsToComplete })}
              </span>
            )}
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">{emergencyFundGoal.title}</span>
              <span className="font-medium text-blue-900">
                {formatVND(emergencyFundGoal.current_amount)} / {formatVND(emergencyFundGoal.target_amount || 0)}
              </span>
            </div>
            
            {aiRecommendation.remainingAmount > 0 && (
              <div className="text-blue-600">
                {t("remainingToTarget", { 
                  amount: formatVND(aiRecommendation.remainingAmount) 
                })}
              </div>
            )}

            {/* Progress bar */}
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ 
                  width: `${Math.min(100, (emergencyFundGoal.current_amount / (emergencyFundGoal.target_amount || 1)) * 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendation */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg mb-6 border border-purple-100">
        <div className="flex items-start space-x-3">
          <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-purple-900">
                {t("aiRecommendationTitle")}
              </h4>
              <span className={`text-xs px-2 py-1 rounded border ${getConfidenceColor(aiRecommendation.confidenceLevel)}`}>
                {t(`confidence${aiRecommendation.confidenceLevel.charAt(0).toUpperCase() + aiRecommendation.confidenceLevel.slice(1)}`)}
              </span>
            </div>
            
            {/* Main recommendation */}
            <div className="bg-white p-3 rounded border-l-4 border-purple-400 mb-3">
              <div className="text-lg font-semibold text-purple-900 mb-1">
                {formatVND(recommendedAmount)}
              </div>
              <p className="text-sm text-gray-700">{aiRecommendation.reasoning}</p>
            </div>
            
            {/* Alternative amounts */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-purple-800 mb-2">
                {t("alternativeAmounts")}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleQuickAmount(minRecommendedAmount)}
                  className="text-xs px-3 py-1 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                >
                  {t("minRecommendation", { amount: formatVND(minRecommendedAmount) })}
                </button>
                <button
                  onClick={() => handleQuickAmount(maxRecommendedAmount)}
                  className="text-xs px-3 py-1 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                >
                  {t("maxRecommendation", { amount: formatVND(maxRecommendedAmount) })}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Amount Buttons */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Quick Select:</p>
        <div className="flex space-x-2 mb-3">
          <button
            onClick={() => handleQuickAmount(recommendedAmount)}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {formatVND(recommendedAmount)}
            <span className="block text-xs opacity-90">Recommended</span>
          </button>
          <button
            onClick={() => handleQuickAmount(minRecommendedAmount)}
            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            {formatVND(minRecommendedAmount)}
            <span className="block text-xs opacity-70">Conservative</span>
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <MoneyInput
          label={t("enterAmount")}
          value={userAmount}
          onChange={setUserAmount}
          placeholder={formatVND(recommendedAmount)}
          error={submitError || undefined}
          touched={!!submitError}
        />
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Primary Action - Transferred */}
        <Button
          onClick={handleConfirmTransfer}
          disabled={isSubmitting || !userAmount}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {isSubmitting ? "Recording..." : t("transferredButton")}
        </Button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleNotTransferred}
            disabled={isSubmitting}
            variant="outline"
            className="text-amber-600 border-amber-300 hover:bg-amber-50"
          >
            <Clock className="w-4 h-4 mr-2" />
            {t("notTransferredButton")}
          </Button>

          <Button
            onClick={handleRemindLater}
            disabled={isSubmitting}
            variant="outline"
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            {t("remindLaterButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}; 