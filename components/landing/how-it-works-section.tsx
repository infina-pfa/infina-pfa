"use client";

import { CardTitle, CardDescription } from "@/components/ui/card";
import { MessageCircle, Brain, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

export function HowItWorksSection() {
  const { t } = useTranslation();

  // Refs for each step to track when they're in view
  const titleRef = useRef(null);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);

  // Track when each element is in view
  const isTitleInView = useInView(titleRef, { once: true, margin: "-100px" });
  const isStep1InView = useInView(step1Ref, { once: true, margin: "-100px" });
  const isStep2InView = useInView(step2Ref, { once: true, margin: "-100px" });
  const isStep3InView = useInView(step3Ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 60 }}
          animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-center mb-8 sm:mb-12 lg:mb-16">
            {t("howItWorksTitle")}
          </h2>
        </motion.div>

        <div className="space-y-16 lg:space-y-24">
          {/* Step 1 */}
          <motion.div
            ref={step1Ref}
            initial={{ opacity: 0 }}
            animate={isStep1InView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16"
          >
            <motion.div
              className="flex-1 lg:order-1"
              initial={{ opacity: 0, x: -60 }}
              animate={
                isStep1InView ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 }
              }
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-2xl flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </motion.div>
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl text-foreground">
                  {t("howItWorksStep1Title")}
                </CardTitle>
              </div>
              <CardDescription className="text-base sm:text-lg lg:text-xl leading-relaxed text-muted-foreground max-w-lg">
                {t("howItWorksStep1Description")}
              </CardDescription>
            </motion.div>
            <motion.div
              className="flex-1 lg:order-2"
              initial={{ opacity: 0, x: 60 }}
              animate={
                isStep1InView ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }
              }
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl blur-3xl"></div>
                <motion.div
                  className="relative bg-section-bg rounded-2xl p-6 sm:p-8 border border-primary/10"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={
                    isStep1InView
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0.8 }
                  }
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  whileHover={{ y: -8 }}
                >
                  <img
                    src="/how-it-work/step-1.png"
                    alt="Step 1: Chat with AI financial coach"
                    className="w-full h-auto rounded-xl shadow-none"
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            ref={step2Ref}
            initial={{ opacity: 0 }}
            animate={isStep2InView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16"
          >
            <motion.div
              className="flex-1 lg:order-2"
              initial={{ opacity: 0, x: 60 }}
              animate={
                isStep2InView ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }
              }
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-success/10 rounded-2xl flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-success" />
                </motion.div>
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl text-foreground">
                  {t("howItWorksStep2Title")}
                </CardTitle>
              </div>
              <CardDescription className="text-base sm:text-lg lg:text-xl leading-relaxed text-muted-foreground max-w-lg">
                {t("howItWorksStep2Description")}
              </CardDescription>
            </motion.div>
            <motion.div
              className="flex-1 lg:order-1"
              initial={{ opacity: 0, x: -60 }}
              animate={
                isStep2InView ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 }
              }
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-success/10 rounded-2xl blur-3xl"></div>
                <motion.div
                  className="relative bg-section-bg rounded-2xl p-6 sm:p-8 border border-success/10"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={
                    isStep2InView
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0.8 }
                  }
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  whileHover={{ y: -8 }}
                >
                  <img
                    src="/how-it-work/step-2.png"
                    alt="Step 2: AI analyzes your financial situation"
                    className="w-full h-auto rounded-xl shadow-none"
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            ref={step3Ref}
            initial={{ opacity: 0 }}
            animate={isStep3InView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16"
          >
            <motion.div
              className="flex-1 lg:order-1"
              initial={{ opacity: 0, x: -60 }}
              animate={
                isStep3InView ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 }
              }
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-warning/10 rounded-2xl flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Target className="w-6 h-6 sm:w-7 sm:h-7 text-warning" />
                </motion.div>
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl text-foreground">
                  {t("howItWorksStep3Title")}
                </CardTitle>
              </div>
              <CardDescription className="text-base sm:text-lg lg:text-xl leading-relaxed text-muted-foreground max-w-lg">
                {t("howItWorksStep3Description")}
              </CardDescription>
            </motion.div>
            <motion.div
              className="flex-1 lg:order-2"
              initial={{ opacity: 0, x: 60 }}
              animate={
                isStep3InView ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }
              }
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-warning/10 rounded-2xl blur-3xl"></div>
                <motion.div
                  className="relative bg-section-bg rounded-2xl p-6 sm:p-8 border border-warning/10"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={
                    isStep3InView
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0.8 }
                  }
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  whileHover={{ y: -8 }}
                >
                  <img
                    src="/how-it-work/step-3.png"
                    alt="Step 3: Get personalized action plan"
                    className="w-full h-auto rounded-xl shadow-none"
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
