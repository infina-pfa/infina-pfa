import {
  CreditCard,
  Building,
  TrendingUp,
  Target,
  Shield,
} from "lucide-react";
type TFunction = (key: string) => string;

export interface FinancialStage {
  id: string;
  title: string;
  description: string;
  badgeText: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  stats: { label: string; value: string };
  tips: string[];
  imageUrl: string;
}

export const getFinancialStages = (t: TFunction): FinancialStage[] => [
  {
    id: "debt",
    title: t("stageDebtTitle"),
    description: t("stageDebtDescription"),
    badgeText: t("stageDebtBadge"),
    color: "#F44336", // Infina Red
    icon: CreditCard,
    stats: {
      label: t("statsAverageTime"),
      value: t("statsDebtTimeValue"),
    },
    tips: [
      t("debtTip1"),
      t("debtTip2"),
      t("debtTip3"),
    ],
    imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "building",
    title: t("stageBuildingTitle"),
    description: t("stageBuildingDescription"),
    badgeText: t("stageBuildingBadge"),
    color: "#0055FF", // Infina Blue
    icon: Building,
    stats: {
      label: t("statsEmergencyFund"),
      value: t("statsEmergencyFundValue"),
    },
    tips: [
      t("buildingTip1"),
      t("buildingTip2"),
      t("buildingTip3"),
    ],
    imageUrl: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "investing",
    title: t("stageInvestingTitle"),
    description: t("stageInvestingDescription"),
    badgeText: t("stageInvestingBadge"),
    color: "#2ECC71", // Infina Green
    icon: TrendingUp,
    stats: {
      label: t("statsAverageReturn"),
      value: t("statsInvestingReturnValue"),
    },
    tips: [
      t("investingTip1"),
      t("investingTip2"),
      t("investingTip3"),
    ],
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "goals",
    title: t("stageGoalsTitle"),
    description: t("stageGoalsDescription"),
    badgeText: t("stageGoalsBadge"),
    color: "#FF9800", // Infina Orange
    icon: Target,
    stats: {
      label: t("statsGoalCompletion"),
      value: t("statsGoalCompletionValue"),
    },
    tips: [
      t("goalsTip1"),
      t("goalsTip2"),
      t("goalsTip3"),
    ],
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "wealth",
    title: t("stageWealthTitle"),
    description: t("stageWealthDescription"),
    badgeText: t("stageWealthBadge"),
    color: "#FFC107", // Infina Yellow
    icon: Shield,
    stats: {
      label: t("statsNetWorth"),
      value: t("statsWealthValue"),
    },
    tips: [
      t("wealthTip1"),
      t("wealthTip2"),
      t("wealthTip3"),
    ],
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
  },
]; 