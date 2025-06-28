"use client";

import { useTranslation } from "react-i18next";
import { ReactLenis } from "lenis/react";
import { useScroll } from "motion/react";
import { useRef } from "react";
import { StageCard } from "./financial-stages/stage-card";
import { getFinancialStages } from "./financial-stages/stages-data";

export function FinancialStagesSection() {
  const { t } = useTranslation();
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  const stages = getFinancialStages(t);

  return (
    <ReactLenis root>
      <main ref={container} className="relative">
        {/* Section Header */}
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            {t("financialStagesTitle")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("financialStagesDescription")}
          </p>
        </div>

        {/* Stages Cards */}
        {stages.map((stage, i) => {
          const targetScale = 1 - (stages.length - i) * 0.05;
          const range: [number, number] = [i * 0.25, 1];

          return (
            <StageCard
              key={stage.id}
              i={i}
              stage={stage}
              progress={scrollYProgress}
              range={range}
              targetScale={targetScale}
            />
          );
        })}
      </main>
    </ReactLenis>
  );
}
