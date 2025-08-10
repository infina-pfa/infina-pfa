"use client";

import { useSurplusAllocationSWR } from "@/hooks/swr-v2/use-surplus-allocation";
import { useAppTranslation } from "@/hooks/use-translation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/validation/input-validation";

import {
  TrendingUp,
  PiggyBank,
  Target,
  Calendar,
  Zap,
  CheckCircle2,
} from "lucide-react";

interface SurplusAllocationMessageProps {
  onSendMessage?: (message: string) => void;
}

export function SurplusAllocationMessage({
  onSendMessage,
}: SurplusAllocationMessageProps) {
  const { t } = useAppTranslation(["budgeting", "goals", "common"]);
  const {
    data,
    loading,
    error,
    allocationAmount,
    setAllocationAmount,
    allocateToEmergencyFund,
    isAllocating,
  } = useSurplusAllocationSWR();

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 space-y-4 max-w-lg">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 text-center max-w-lg">
        <Target className="mx-auto h-8 w-8 text-red-500 mb-2" />
        <p className="text-gray-500">{t("common:errorLoadingData")}</p>
      </div>
    );
  }

  if (!data || !data.hasSurplus) {
    return (
      <div className="bg-white rounded-lg p-6 text-center max-w-lg">
        <PiggyBank className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t("surplusNoSurplus")}
        </h3>
        <p className="text-gray-500">{t("surplusComeBackNext")}</p>
      </div>
    );
  }

  if (!data.emergencyFundGoal) {
    return (
      <div className="bg-white rounded-lg p-6 text-center max-w-lg">
        <Target className="mx-auto h-12 w-12 text-blue-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t("surplusNoEmergencyFund")}
        </h3>
        <p className="text-gray-500 mb-4">{t("surplusCreateFirst")}</p>
        <Button
          className="bg-[#0055FF] hover:bg-[#0044CC] text-white"
          onClick={() =>
            onSendMessage &&
            onSendMessage("I want to create an emergency fund goal")
          }
        >
          <Target className="h-4 w-4 mr-2" />
          {t("surplusCreateGoal")}
        </Button>
      </div>
    );
  }

  const formatMonthYear = () => {
    const now = new Date();
    return now.toLocaleDateString("vi-VN", {
      month: "long",
      year: "numeric",
    });
  };

  const handleSliderChange = (value: number) => {
    const newAmount = (value / 100) * data.surplusAmount;
    setAllocationAmount(Math.round(newAmount));
  };

  const handleAllAllocation = () => {
    setAllocationAmount(data.surplusAmount);
  };

  const handleConfirmAllocation = async () => {
    const success = await allocateToEmergencyFund();
    if (success && onSendMessage) {
      onSendMessage(
        `I've allocated ${formatVND(
          allocationAmount
        )} from my surplus to my emergency fund!`
      );
    }
  };

  const sliderPercentage =
    data.surplusAmount > 0 ? (allocationAmount / data.surplusAmount) * 100 : 0;

  return (
    <div className="bg-white rounded-lg p-6 space-y-6 max-w-lg">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {t("surplusAllocationTitle")}
        </h3>
        <p className="text-sm text-gray-600 flex items-center justify-center">
          <Calendar className="h-4 w-4 mr-1" />
          {formatMonthYear()}
        </p>
      </div>

      {/* Surplus Summary */}
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-6 w-6 text-green-500" />
          <div className="flex-1">
            <h4 className="font-semibold text-green-700">
              {t("surplusGreatJob")}
            </h4>
            <p className="text-sm text-green-600">
              {t("surplusSavedAmount", {
                amount: formatVND(data.surplusAmount),
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Allocation Controls */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center">
          <PiggyBank className="h-4 w-4 mr-2 text-blue-500" />
          {t("surplusAllocateToEmergency")}
        </h4>

        {/* Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {t("surplusAllocationAmount")}
            </span>
            <span className="font-medium text-blue-600">
              {formatVND(allocationAmount)} ({Math.round(sliderPercentage)}%)
            </span>
          </div>

          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPercentage}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #0055FF ${sliderPercentage}%, #e5e7eb ${sliderPercentage}%)`,
              }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>0</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAllAllocation}
              className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
            >
              {t("surplusAllAll")}
            </Button>
            <span>{formatVND(data.surplusAmount)}</span>
          </div>
        </div>
      </div>

      {/* Impact Preview */}
      {allocationAmount > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            {t("surplusImpactPreview")}
          </h4>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">{t("surplusNewTotal")}</span>
              <span className="font-medium text-blue-900">
                {formatVND(data.newEmergencyFundTotal)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-blue-700">
                {t("surplusMonthsCoverage")}
              </span>
              <span className="font-medium text-blue-900">
                {t("surplusMonthsCount", {
                  count: Math.round(data.newMonthsOfCoverage * 10) / 10,
                })}
              </span>
            </div>

            {data.progressImpact > 0 && (
              <div className="flex justify-between">
                <span className="text-blue-700">
                  {t("surplusProgressGain")}
                </span>
                <span className="font-medium text-green-600">
                  +{Math.round(data.progressImpact)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        {allocationAmount > 0 ? (
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={handleConfirmAllocation}
            disabled={isAllocating}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {isAllocating
              ? t("surplusAllocating")
              : t("surplusConfirmAllocation", {
                  amount: formatVND(allocationAmount),
                })}
          </Button>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-2">
              {t("surplusSelectAmount")}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onSendMessage &&
              onSendMessage("Show me other ways to use my surplus money")
            }
          >
            <Target className="h-4 w-4 mr-1" />
            {t("surplusOtherOptions")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onSendMessage &&
              onSendMessage("Help me set savings goals for next month")
            }
          >
            <PiggyBank className="h-4 w-4 mr-1" />
            {t("surplusSetGoals")}
          </Button>
        </div>
      </div>
    </div>
  );
}
