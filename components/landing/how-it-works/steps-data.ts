import { MessageCircle, Brain, Target } from "lucide-react";

export interface HowItWorksStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  gradientColor: string;
  borderColor: string;
  imageUrl: string;
  imageAlt: string;
}

type TFunction = (key: string) => string;

export const getHowItWorksSteps = (t: TFunction): HowItWorksStep[] => [
  {
    id: "chat",
    title: t("howItWorksStep1Title"),
    description: t("howItWorksStep1Description"),
    icon: MessageCircle,
    iconColor: "text-primary",
    gradientColor: "from-primary/5 to-primary/10",
    borderColor: "border-primary/10",
    imageUrl: "/how-it-work/step-1.png",
    imageAlt: t("howItWorksStep1ImageAlt"),
  },
  {
    id: "analyze",
    title: t("howItWorksStep2Title"),
    description: t("howItWorksStep2Description"),
    icon: Brain,
    iconColor: "text-success",
    gradientColor: "from-success/5 to-success/10",
    borderColor: "border-success/10",
    imageUrl: "/how-it-work/step-2.png",
    imageAlt: t("howItWorksStep2ImageAlt"),
  },
  {
    id: "plan",
    title: t("howItWorksStep3Title"),
    description: t("howItWorksStep3Description"),
    icon: Target,
    iconColor: "text-warning",
    gradientColor: "from-warning/5 to-warning/10",
    borderColor: "border-warning/10",
    imageUrl: "/how-it-work/step-3.png",
    imageAlt: t("howItWorksStep3ImageAlt"),
  },
]; 