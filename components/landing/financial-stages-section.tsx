"use client";

import {
  CreditCard,
  Building,
  TrendingUp,
  Target,
  Shield,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { ReactLenis } from "lenis/react";
import { useTransform, motion, useScroll, MotionValue } from "motion/react";
import { useRef } from "react";
import { useRouter } from "next/navigation";

interface FinancialStage {
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

interface StageCardProps {
  i: number;
  stage: FinancialStage;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}

const StageCard = ({
  i,
  stage,
  progress,
  range,
  targetScale,
}: StageCardProps) => {
  const { t } = useTranslation();
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "start start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1.2, 1]);
  const scale = useTransform(progress, range, [1, targetScale]);
  const Icon = stage.icon;

  return (
    <div
      ref={container}
      className="h-screen flex items-center justify-center sticky top-0"
    >
      <motion.div
        style={{
          backgroundColor: stage.color,
          scale,
          top: `calc(-5vh + ${i * 25}px)`,
        }}
        className="flex flex-col relative h-[500px] w-[85%] max-w-5xl rounded-3xl p-8 lg:p-12 origin-top shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full backdrop-blur-sm">
              {stage.badgeText}
            </span>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mt-2">
              {stage.title}
            </h2>
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Content */}
          <div className="space-y-6">
            <p className="text-white/90 text-base lg:text-lg leading-relaxed">
              {stage.description}
            </p>

            {/* Stats */}
            <div className="bg-white/10 rounded-2xl p-4 lg:p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm font-medium">
                  {stage.stats.label}
                </span>
                <span className="text-white text-lg lg:text-xl font-bold">
                  {stage.stats.value}
                </span>
              </div>
            </div>

            {/* Key Strategies */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-lg">
                {t("keyStrategies", "Key strategies:")}
              </h4>
              <ul className="space-y-2">
                {stage.tips.slice(0, 3).map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-white/80 mt-0.5 flex-shrink-0" />
                    <span className="text-white/90 text-sm lg:text-base">
                      {tip}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-white/90 transition-colors">
                <span>{t("exploreStage", "Explore this stage")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm">
            <motion.div
              className="w-full h-full min-h-[300px]"
              style={{ scale: imageScale }}
            >
              <img
                src={stage.imageUrl}
                alt={stage.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export function FinancialStagesSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  const handleSignUp = () => {
    router.push("/auth/sign-up");
  };

  const stages: FinancialStage[] = [
    {
      id: "debt",
      title: t("stageDebtTitle", "Eliminate debt"),
      description: t(
        "stageDebtDescription",
        "Focus on paying off high-interest debt systematically while building healthy financial habits for long-term success."
      ),
      badgeText: "Stage 1",
      color: "#F44336", // Red from Infina palette
      icon: CreditCard,
      stats: {
        label: t("statsAverageTime", "Average time"),
        value: t("statsDebtTimeValue", "3-6 months"),
      },
      tips: [
        t("debtTip1", "List all debts by interest rate"),
        t("debtTip2", "Consider debt consolidation options"),
        t("debtTip3", "Create a realistic payoff timeline"),
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "building",
      title: t("stageBuildingTitle", "Build foundation"),
      description: t(
        "stageBuildingDescription",
        "Establish an emergency fund and create solid financial foundations that will support your future growth and investments."
      ),
      badgeText: "Stage 2",
      color: "#0055FF", // Blue from Infina palette
      icon: Building,
      stats: {
        label: t("statsEmergencyFund", "Emergency fund"),
        value: t("statsEmergencyFundValue", "3-6 months expenses"),
      },
      tips: [
        t("buildingTip1", "Start with $1,000 mini emergency fund"),
        t("buildingTip2", "Automate savings transfers"),
        t("buildingTip3", "Use high-yield savings account"),
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "investing",
      title: t("stageInvestingTitle", "Start investing"),
      description: t(
        "stageInvestingDescription",
        "Begin building wealth through strategic investments, taking advantage of compound growth and market opportunities."
      ),
      badgeText: "Stage 3",
      color: "#2ECC71", // Green from Infina palette
      icon: TrendingUp,
      stats: {
        label: t("statsTargetReturn", "Target return"),
        value: t("statsReturnValue", "7-10% annually"),
      },
      tips: [
        t("investingTip1", "Start with index funds"),
        t("investingTip2", "Maximize employer 401(k) match"),
        t("investingTip3", "Consider Roth IRA benefits"),
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "optimize",
      title: t("stageOptimizeTitle", "Optimize assets"),
      description: t(
        "stageOptimizeDescription",
        "Fine-tune your investment strategy, diversify your portfolio, and optimize for tax efficiency as your wealth grows."
      ),
      badgeText: "Stage 4",
      color: "#FF9800", // Orange from Infina palette
      icon: Target,
      stats: {
        label: t("statsPortfolioSize", "Portfolio size"),
        value: t("statsPortfolioValue", "$100K+ target"),
      },
      tips: [
        t("optimizeTip1", "Diversify across asset classes"),
        t("optimizeTip2", "Tax-loss harvesting strategies"),
        t("optimizeTip3", "Review and rebalance quarterly"),
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "protect",
      title: t("stageProtectTitle", "Protect assets"),
      description: t(
        "stageProtectDescription",
        "Safeguard your wealth through proper insurance, estate planning, and risk management strategies for long-term security."
      ),
      badgeText: "Stage 5",
      color: "#9C27B0", // Purple (close to Infina palette)
      icon: Shield,
      stats: {
        label: t("statsNetWorth", "Net worth"),
        value: t("statsNetWorthValue", "$500K+ milestone"),
      },
      tips: [
        t("protectTip1", "Estate planning essentials"),
        t("protectTip2", "Insurance coverage review"),
        t("protectTip3", "Legacy wealth strategies"),
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <ReactLenis root>
      <section ref={container} className="bg-gray-50">
        {/* Header Section */}
        <div className="py-16 sm:py-20 lg:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              {t("financialStagesTitle", "Your personalized financial journey")}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              {t(
                "financialStagesSubtitle",
                "Every financial journey is unique. Our AI adapts to your current stage and guides you to the next level."
              )}
            </p>
            <div className="inline-flex items-center gap-2 text-gray-500 text-sm bg-gray-100 rounded-full px-4 py-2">
              <span>
                {t("scrollToExplore", "Scroll to explore each stage")}
              </span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Stacking Cards Section */}
        <div className="relative">
          {stages.map((stage, i) => {
            const targetScale = 1 - (stages.length - i) * 0.05;
            return (
              <StageCard
                key={stage.id}
                i={i}
                stage={stage}
                progress={scrollYProgress}
                range={[i * 0.25, 1]}
                targetScale={targetScale}
              />
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="py-16 sm:py-20 bg-white text-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {t(
                "stagesCallToAction",
                "Ready to accelerate your financial journey?"
              )}
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              {t(
                "stagesCallToActionDescription",
                "Get personalized guidance tailored to your current financial stage and goals."
              )}
            </p>
            <button
              onClick={handleSignUp}
              className="px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              {t("startJourney", "Start your personalized plan")}
            </button>
          </div>
        </div>
      </section>
    </ReactLenis>
  );
}
