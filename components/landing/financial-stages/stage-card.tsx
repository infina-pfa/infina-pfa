"use client";

import { CheckCircle, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTransform, motion, MotionValue, useScroll } from "motion/react";
import { useRef } from "react";
import { FinancialStage } from "./stages-data";

interface StageCardProps {
  i: number;
  stage: FinancialStage;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}

export const StageCard = ({
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
        className="flex flex-col relative h-[500px] w-[85%] max-w-5xl rounded-2xl p-8 lg:p-12 origin-top"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full backdrop-blur-sm">
              {stage.badgeText}
            </span>
            <h3 className="text-2xl lg:text-3xl font-bold text-white mt-2">
              {stage.title}
            </h3>
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
            <div className="bg-white/10 rounded-xl p-4 lg:p-6 backdrop-blur-sm">
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
                {t("keyStrategies")}
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
                <span>{t("exploreStage")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm">
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
