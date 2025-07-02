"use client";

import { useAppTranslation } from "@/hooks/use-translation";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { HowItWorksStep } from "./how-it-works/how-it-works-step";
import { getHowItWorksSteps } from "./how-it-works/steps-data";

export function HowItWorksSection() {
  const { t } = useAppTranslation(["howItWorks", "common"]);
  const titleRef = useRef(null);
  const isTitleInView = useInView(titleRef, { once: true, margin: "-100px" });

  const steps = getHowItWorksSteps(t);

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 60 }}
          animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-section text-foreground text-center mb-16">
            {t("howItWorksTitle")}
          </h2>
        </motion.div>

        <div className="space-y-24">
          {steps.map((step, index) => (
            <HowItWorksStep
              key={step.id}
              step={step}
              index={index}
              isReversed={index % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
