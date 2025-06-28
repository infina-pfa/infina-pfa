"use client";

import { CardTitle, CardDescription } from "@/components/ui/card";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { HowItWorksStep as HowItWorksStepType } from "./steps-data";

interface HowItWorksStepProps {
  step: HowItWorksStepType;
  index: number;
  isReversed: boolean;
}

export const HowItWorksStep = ({ step, isReversed }: HowItWorksStepProps) => {
  const stepRef = useRef(null);
  const isStepInView = useInView(stepRef, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={stepRef}
      initial={{ opacity: 0 }}
      animate={isStepInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16"
    >
      {/* Content */}
      <motion.div
        className={`flex-1 ${isReversed ? "lg:order-2" : "lg:order-1"}`}
        initial={{ opacity: 0, x: isReversed ? 60 : -60 }}
        animate={
          isStepInView
            ? { opacity: 1, x: 0 }
            : { opacity: 0, x: isReversed ? 60 : -60 }
        }
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="mb-6">
          <CardTitle className="text-xl sm:text-2xl lg:text-3xl text-foreground">
            {step.title}
          </CardTitle>
        </div>
        <CardDescription className="text-base sm:text-lg lg:text-xl leading-relaxed text-muted-foreground max-w-lg">
          {step.description}
        </CardDescription>
      </motion.div>

      {/* Image */}
      <motion.div
        className={`flex-1 ${isReversed ? "lg:order-1" : "lg:order-2"}`}
        initial={{ opacity: 0, x: isReversed ? -60 : 60 }}
        animate={
          isStepInView
            ? { opacity: 1, x: 0 }
            : { opacity: 0, x: isReversed ? -60 : 60 }
        }
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="relative">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${step.gradientColor} rounded-2xl blur-3xl`}
          ></div>
          <motion.div
            className={`relative bg-section-bg rounded-2xl p-6 sm:p-8 border ${step.borderColor}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              isStepInView
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.8 }
            }
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            whileHover={{ y: -8 }}
          >
            <img
              src={step.imageUrl}
              alt={step.imageAlt}
              className="w-full h-auto rounded-xl"
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
