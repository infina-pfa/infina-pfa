"use client";

import { useState } from "react";
import {
  OnboardingComponent,
  ComponentResponse,
} from "@/lib/types/onboarding.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { useAuthContext } from "@/components/providers/auth-provider";
import { goalService } from "@/lib/services-v2/goal.service";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Target,
  Calendar,
  DollarSign,
  Edit3,
  Sparkles,
  TrendingUp,
} from "lucide-react";

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
  const { user } = useAuthContext();

  const goalDetails = component.context.goalDetails as GoalDetails;
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Create or update emergency fund goal in the database
   */
  const createOrUpdateEmergencyFundGoal = async () => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Calculate due date based on timeframe (months from now)
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + goalDetails.timeframe);

    // Emergency fund goal data
    const emergencyFundData = {
      title: "Quỹ Dự phòng Khẩn cấp",
      description: `Mục tiêu xây dựng quỹ dự phòng khẩn cấp ${formatCurrency(
        goalDetails.amount
      )} VND trong ${
        goalDetails.timeframe
      } tháng với mức tiết kiệm ${formatCurrency(
        goalDetails.monthlyTarget
      )} VND mỗi tháng.`,
      target_amount: goalDetails.amount,
      current_amount: 0,
      due_date: dueDate.toISOString(),
    };

    // First, check if an emergency fund goal already exists
    const existingGoalsResponse = await goalService.getAll(undefined, t);

    if (existingGoalsResponse.error) {
      throw new Error(existingGoalsResponse.error);
    }

    // Look for existing emergency fund goal (by title)
    const existingEmergencyFundGoal = existingGoalsResponse.goals.find(
      (goal) =>
        goal.title.toLowerCase().includes("quỹ dự phòng") ||
        goal.title.toLowerCase().includes("emergency fund")
    );

    if (existingEmergencyFundGoal) {
      // Update existing goal
      console.log(
        "Updating existing emergency fund goal:",
        existingEmergencyFundGoal.id
      );
      const updateResponse = await goalService.update(
        existingEmergencyFundGoal.id,
        emergencyFundData,
        t
      );

      if (updateResponse.error) {
        throw new Error(updateResponse.error);
      }

      return updateResponse.goal;
    } else {
      // Create new goal
      console.log("Creating new emergency fund goal");
      const createResponse = await goalService.create(emergencyFundData, t);

      if (createResponse.error) {
        throw new Error(createResponse.error);
      }

      return createResponse.goal;
    }
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Create or update emergency fund goal
      const goal = await createOrUpdateEmergencyFundGoal();
      console.log("Emergency fund goal created/updated successfully:", goal);

      await onResponse({
        goalConfirmed: true,
        goalDetails: {
          amount: goalDetails.amount,
          timeframe: goalDetails.timeframe,
          monthlyTarget: goalDetails.monthlyTarget,
          type: "emergency_fund",
        },
        userAction: "confirmed",
        userMessage: t("goalConfirmationUserMessage", {
          ns: "onboarding",
          amount: formatCurrency(goalDetails.amount),
          timeframe: goalDetails.timeframe,
          monthlyTarget: formatCurrency(goalDetails.monthlyTarget),
          defaultValue: `Tôi đã xác nhận mục tiêu Quỹ Dự Phòng Khẩn Cấp ${formatCurrency(
            goalDetails.amount
          )} VND trong ${
            goalDetails.timeframe
          } tháng với mức tiết kiệm ${formatCurrency(
            goalDetails.monthlyTarget
          )} VND/tháng. Hãy hướng dẫn tôi các bước tiếp theo để bắt đầu thực hiện mục tiêu này.`,
        }),
        nextSteps: "guide_implementation",
        actionContext: {
          goalType: "emergency_fund",
          amount: goalDetails.amount,
          monthlyTarget: goalDetails.monthlyTarget,
          timeframe: goalDetails.timeframe,
          readyToStart: true,
          goalId: goal?.id, // Include the goal ID for reference
        },
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Error confirming goal:", error);
      // You could add error handling UI here if needed
      // For now, we'll still proceed with the onResponse to not break the flow
      await onResponse({
        goalConfirmed: true,
        goalDetails: {
          amount: goalDetails.amount,
          timeframe: goalDetails.timeframe,
          monthlyTarget: goalDetails.monthlyTarget,
          type: "emergency_fund",
        },
        userAction: "confirmed",
        userMessage: t("goalConfirmationUserMessage", {
          ns: "onboarding",
          amount: formatCurrency(goalDetails.amount),
          timeframe: goalDetails.timeframe,
          monthlyTarget: formatCurrency(goalDetails.monthlyTarget),
          defaultValue: `Tôi đã xác nhận mục tiêu Quỹ Dự Phòng Khẩn Cấp ${formatCurrency(
            goalDetails.amount
          )} VND trong ${
            goalDetails.timeframe
          } tháng với mức tiết kiệm ${formatCurrency(
            goalDetails.monthlyTarget
          )} VND/tháng. Hãy hướng dẫn tôi các bước tiếp theo để bắt đầu thực hiện mục tiêu này.`,
        }),
        nextSteps: "guide_implementation",
        actionContext: {
          goalType: "emergency_fund",
          amount: goalDetails.amount,
          monthlyTarget: goalDetails.monthlyTarget,
          timeframe: goalDetails.timeframe,
          readyToStart: true,
          goalCreationError:
            error instanceof Error ? error.message : "Unknown error",
        },
        completedAt: new Date(),
      });
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
        userAction: "requested_adjustment",
        userMessage: t("goalAdjustmentUserMessage", {
          ns: "onboarding",
          amount: formatCurrency(goalDetails.amount),
          timeframe: goalDetails.timeframe,
          monthlyTarget: formatCurrency(goalDetails.monthlyTarget),
          defaultValue: `Tôi muốn điều chỉnh lại mục tiêu quỹ dự phòng khẩn cấp. Mục tiêu hiện tại ${formatCurrency(
            goalDetails.amount
          )} VND trong ${goalDetails.timeframe} tháng (${formatCurrency(
            goalDetails.monthlyTarget
          )} VND/tháng) chưa phù hợp với tình hình của tôi. Hãy giúp tôi tính toán lại với các thông số khác.`,
        }),
        adjustmentReason: "user_wants_different_parameters",
        nextSteps: "recalculate_goal",
        actionContext: {
          goalType: "emergency_fund",
          currentAmount: goalDetails.amount,
          currentMonthlyTarget: goalDetails.monthlyTarget,
          currentTimeframe: goalDetails.timeframe,
          needsAdjustment: true,
          adjustmentRequested: true,
        },
        completedAt: new Date(),
      });
    } catch (error) {
      console.error("Error rejecting goal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const progressPercentage = Math.min(
    ((goalDetails.monthlyTarget * goalDetails.timeframe) / goalDetails.amount) *
      100,
    100
  );

  return (
    <div className="space-y-5 font-nunito max-w-2xl mx-auto">
      {/* Header với Goal Icon */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-[#0055FF] rounded-full flex items-center justify-center mx-auto">
          <Target className="text-white" size={24} />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-[#111827] mb-2">
            {t("emergencyFundGoal")}
          </h3>
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="text-[#0055FF]" size={18} />
            <p className="text-2xl font-bold text-[#0055FF]">
              {formatCurrency(goalDetails.amount)} VND
            </p>
            <Sparkles className="text-[#0055FF]" size={18} />
          </div>
        </div>
      </div>

      {/* Goal Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-[#F0F2F5] p-5 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#2ECC71] rounded-full flex items-center justify-center">
              <DollarSign className="text-white" size={20} />
            </div>
            <div>
              <p className="text-sm text-[#6B7280] font-medium">
                {t("monthlyTarget")}
              </p>
              <p className="text-lg font-semibold text-[#111827]">
                {formatCurrency(goalDetails.monthlyTarget)} VND
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#F0F2F5] p-5 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#FF9800] rounded-full flex items-center justify-center">
              <Calendar className="text-white" size={20} />
            </div>
            <div>
              <p className="text-sm text-[#6B7280] font-medium">
                {t("timeToGoal")}
              </p>
              <p className="text-lg font-semibold text-[#111827]">
                {goalDetails.timeframe} {t("months")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview - Simplified Single Progress Bar */}
      <div className="bg-white p-5 rounded-xl">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="text-[#0055FF]" size={18} />
          <h4 className="font-semibold text-[#111827] text-base">
            {t("yourProgressTimeline")}
          </h4>
        </div>

        {/* Overall Progress */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#6B7280]">Tiến độ tổng thể</span>
            <span className="text-sm font-semibold text-[#111827]">
              {goalDetails.timeframe} tháng
            </span>
          </div>

          <div className="relative">
            <div className="w-full bg-[#E5E7EB] rounded-full h-4">
              <div
                className="bg-gradient-to-r from-[#0055FF] to-[#2ECC71] h-4 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              >
                {progressPercentage >= 20 && (
                  <span className="text-white text-xs font-bold">
                    {Math.round(progressPercentage)}%
                  </span>
                )}
              </div>
            </div>
            {progressPercentage < 20 && (
              <span className="absolute right-0 top-5 text-xs font-semibold text-[#6B7280]">
                {Math.round(progressPercentage)}%
              </span>
            )}
          </div>

          {/* Milestone Indicators */}
          <div className="flex justify-between text-xs text-[#6B7280] mt-2">
            <div className="text-center">
              <div className="w-2 h-2 bg-[#0055FF] rounded-full mx-auto mb-1"></div>
              <span>Bắt đầu</span>
            </div>
            <div className="text-center">
              <div className="w-2 h-2 bg-[#FF9800] rounded-full mx-auto mb-1"></div>
              <span>3 tháng</span>
            </div>
            <div className="text-center">
              <div className="w-2 h-2 bg-[#FFC107] rounded-full mx-auto mb-1"></div>
              <span>6 tháng</span>
            </div>
            <div className="text-center">
              <div className="w-2 h-2 bg-[#2ECC71] rounded-full mx-auto mb-1"></div>
              <span>Hoàn thành</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#E5E7EB]">
            <div className="text-center">
              <p className="text-xs text-[#6B7280]">Tiết kiệm/tháng</p>
              <p className="text-sm font-semibold text-[#111827]">
                {formatCurrency(goalDetails.monthlyTarget)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#6B7280]">Tổng tiết kiệm</p>
              <p className="text-sm font-semibold text-[#2ECC71]">
                {formatCurrency(goalDetails.amount)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#6B7280]">Thời gian</p>
              <p className="text-sm font-semibold text-[#FF9800]">
                {goalDetails.timeframe} tháng
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section - Redesigned */}
      <div className="bg-[#F6F7F9] p-5 rounded-xl">
        <h4 className="font-semibold text-[#111827] text-base mb-3 flex items-center">
          <CheckCircle className="text-[#2ECC71] mr-2" size={18} />
          {t("emergencyFundBenefits")}
        </h4>
        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-[#2ECC71] rounded-full flex items-center justify-center mt-0.5">
              <CheckCircle className="text-white" size={12} />
            </div>
            <span className="text-sm text-[#374151] leading-relaxed">
              {t("benefit1")}
            </span>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-[#2ECC71] rounded-full flex items-center justify-center mt-0.5">
              <CheckCircle className="text-white" size={12} />
            </div>
            <span className="text-sm text-[#374151] leading-relaxed">
              {t("benefit2")}
            </span>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-[#2ECC71] rounded-full flex items-center justify-center mt-0.5">
              <CheckCircle className="text-white" size={12} />
            </div>
            <span className="text-sm text-[#374151] leading-relaxed">
              {t("benefit3")}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons - Improved Design */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="flex-1 bg-[#0055FF] text-white hover:bg-[#0044DD] py-3 text-base font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t("submitting", { ns: "common" })}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle size={18} />
              <span>{t("confirmGoal")}</span>
            </div>
          )}
        </Button>

        <Button
          onClick={handleReject}
          disabled={isSubmitting}
          className="flex-1 bg-white text-[#0055FF] border-2 border-[#0055FF] hover:bg-[#F0F2F5] py-3 text-base font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
        >
          <div className="flex items-center justify-center space-x-2">
            <Edit3 size={18} />
            <span>{t("adjustGoal")}</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
