"use client";

import { useState } from "react";
import { useGoalDashboardSWR } from "@/hooks/swr/use-goal-dashboard";
import { useGoalDeposit } from "@/hooks/swr/use-goal-deposit";
import { useAppTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/circular-progress";
import { MoneyInput } from "@/components/ui/money-input";
import { formatVND } from "@/lib/validation/input-validation";
import { formatCurrency } from "@/lib/utils";

import { Target, Calendar, Plus, Wallet, Clock, Check, X } from "lucide-react";

interface GoalDashboardMessageProps {
  onSendMessage?: (message: string) => void;
}

export function GoalDashboardMessage({ onSendMessage }: GoalDashboardMessageProps) {
  const { t } = useAppTranslation(["goals", "common"]);
  const { data, loading, error, refetch } = useGoalDashboardSWR();
  const { deposit, isLoading: isDepositing } = useGoalDeposit();
  const { success, error: showError } = useToast();

  // State for input mode
  const [isInputMode, setIsInputMode] = useState(false);
  const [inputAmount, setInputAmount] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  // Reset input state
  const resetInput = () => {
    setIsInputMode(false);
    setInputAmount("");
    setInputError(null);
  };

  // Handle add money button click
  const handleAddMoney = () => {
    setIsInputMode(true);
    setInputError(null);
  };

  // Handle cancel input
  const handleCancelInput = () => {
    resetInput();
  };

  // Validate input amount
  const validateAmount = (amount: string): boolean => {
    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setInputError(t("amountMustBePositive", { ns: "common" }));
      return false;
    }
    setInputError(null);
    return true;
  };

  // Handle confirm deposit
  const handleConfirmDeposit = async () => {
    if (!data?.emergencyFundGoal || !validateAmount(inputAmount)) {
      return;
    }

    try {
      const result = await deposit(data.emergencyFundGoal.id, {
        name: `${data.emergencyFundGoal.title}`,
        amount: parseFloat(inputAmount),
        description: "Added from goal dashboard",
      });

      if (result) {
        success(
          t("success", { ns: "common" }),
          t("depositSuccess", {
            amount: formatCurrency(parseFloat(inputAmount)),
            goal: data.emergencyFundGoal.title,
          })
        );
        
        // Send confirmation message to chat
        if (onSendMessage) {
          const confirmationMessage = t("depositSuccess", {
            amount: formatCurrency(parseFloat(inputAmount)),
            goal: data.emergencyFundGoal.title,
          });
          onSendMessage(confirmationMessage);
        }
        
        resetInput();
        // Refresh dashboard data
        await refetch();
      }
    } catch (err) {
      console.error("Error depositing to goal:", err);
      showError(
        t("error", { ns: "common" }),
        err instanceof Error ? err.message : t("depositFailed")
      );
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 space-y-6" style={{ fontFamily: 'Nunito, sans-serif' }}>
        <div className="text-center space-y-3">
          <Skeleton className="h-7 w-64 mx-auto" />
          <Skeleton className="h-5 w-48 mx-auto" />
        </div>
        <div className="flex justify-center">
          <Skeleton className="h-32 w-32 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 text-center" style={{ fontFamily: 'Nunito, sans-serif' }}>
        <div className="space-y-4">
          <Target className="mx-auto h-12 w-12" style={{ color: '#FF9800' }} />
          <p className="text-gray-600">{t("common:errorLoadingData")}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="text-white"
            style={{ backgroundColor: '#0055FF', fontFamily: 'Nunito, sans-serif' }}
          >
            {t("common:tryAgain")}
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white p-6 text-center space-y-6" style={{ fontFamily: 'Nunito, sans-serif' }}>
        <div className="space-y-4">
          <div 
            className="mx-auto w-16 h-16 flex items-center justify-center rounded-full"
            style={{ backgroundColor: '#F0F2F5' }}
          >
            <Target className="h-8 w-8" style={{ color: '#0055FF' }} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">
              {t("goalDashboardNoGoal")}
            </h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              {t("goalDashboardCreateFirst")}
            </p>
          </div>
          <Button 
            className="text-white px-6 py-3 text-base font-semibold"
            style={{ backgroundColor: '#0055FF', fontFamily: 'Nunito, sans-serif' }}
            onClick={() => onSendMessage && onSendMessage("I want to create my first emergency fund goal")}
          >
            <Plus className="h-5 w-5 mr-2" />
            {t("createGoal")}
          </Button>
        </div>
      </div>
    );
  }

  const getMotivationalMessage = (percentage: number) => {
    if (percentage >= 100) return t("goalDashboardCompleted");
    if (percentage >= 75) return t("goalDashboardAlmostThere");
    if (percentage >= 50) return t("goalDashboardHalfway");
    if (percentage >= 25) return t("goalDashboardGoodStart");
    return t("goalDashboardJustStarted");
  };

  const formatCompletionDate = (dateString: string) => {
    if (!dateString) return t("goalDashboardNotSet");
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return '#2ECC71'; // Green for completed
    if (percentage >= 75) return '#0055FF'; // Blue for almost there
    if (percentage >= 50) return '#0055FF'; // Blue for halfway
    return '#0055FF'; // Default blue
  };

  return (
    <div className="bg-white p-6 space-y-6" style={{ fontFamily: 'Nunito, sans-serif' }}>
      {/* Header Section */}
      <div className="text-center space-y-3">
        <h3 className="text-2xl font-bold text-gray-900">
          {t("goalDashboardTitle")}
        </h3>
        <p className="text-gray-600 text-base">
          {getMotivationalMessage(data.progressPercentage)}
        </p>
      </div>

      {/* Circular Progress Section */}
      <div className="flex justify-center py-4">
        <CircularProgress 
          value={data.progressPercentage}
          size={140}
          strokeWidth={10}
          color={getProgressColor(data.progressPercentage)}
          backgroundColor="#F0F2F5"
        >
          <div className="text-center">
            <div 
              className="text-3xl font-bold mb-1"
              style={{ color: getProgressColor(data.progressPercentage), fontFamily: 'Nunito, sans-serif' }}
            >
              {Math.round(data.progressPercentage)}%
            </div>
            <div className="text-sm text-gray-500">
              {t("goalDashboardProgress")}
            </div>
          </div>
        </CircularProgress>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center text-gray-600">
            <Wallet className="h-4 w-4 mr-1" style={{ color: '#0055FF' }} />
            <span className="text-sm font-medium">{t("currentAmount")}</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {formatVND(data.currentAmount)}
          </div>
        </div>
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center text-gray-600">
            <Target className="h-4 w-4 mr-1" style={{ color: '#2ECC71' }} />
            <span className="text-sm font-medium">{t("targetAmount")}</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {formatVND(data.targetAmount)}
          </div>
        </div>
      </div>

      {/* Additional Info Section */}
      <div className="space-y-4">
        <div 
          className="p-4 space-y-3"
          style={{ backgroundColor: '#F6F7F9' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-700">
              <Calendar className="h-4 w-4 mr-2" style={{ color: '#FF9800' }} />
              <span className="text-sm font-medium">{t("goalDashboardProjectedCompletion")}</span>
            </div>
            <span className="font-medium text-gray-900 text-sm">
              {formatCompletionDate(data.projectedCompletionDate)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-700">
              <Clock className="h-4 w-4 mr-2" style={{ color: '#0055FF' }} />
              <span className="text-sm font-medium">{t("goalDashboardRemainingAmount")}</span>
            </div>
            <span className="font-bold text-gray-900">
              {formatVND(data.remainingAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Section */}
      {!isInputMode ? (
        <div className="pt-2">
          <Button 
            className="w-full text-white py-3 text-base font-semibold"
            style={{ backgroundColor: '#0055FF', fontFamily: 'Nunito, sans-serif' }}
            onClick={handleAddMoney}
            disabled={isDepositing}
          >
            <Plus className="h-5 w-5 mr-2" />
            {t("goalDashboardAddMoney")}
          </Button>
        </div>
      ) : (
        <div className="pt-2 space-y-4">
          {/* Money Input */}
          <div>
                         <MoneyInput
               label={t("amount", { ns: "common" })}
               value={inputAmount}
               onChange={(value) => setInputAmount(value)}
               error={inputError || undefined}
               placeholder="0.00"
               disabled={isDepositing}
             />
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 py-3 text-base font-semibold"
              onClick={handleCancelInput}
              disabled={isDepositing}
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              <X className="h-4 w-4 mr-2" />
              {t("cancel", { ns: "common" })}
            </Button>
            <Button
              className="flex-1 text-white py-3 text-base font-semibold"
              style={{ backgroundColor: '#0055FF', fontFamily: 'Nunito, sans-serif' }}
              onClick={handleConfirmDeposit}
              disabled={isDepositing || !inputAmount}
            >
              <Check className="h-4 w-4 mr-2" />
              {isDepositing ? t("depositing") : t("confirm", { ns: "common" })}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 