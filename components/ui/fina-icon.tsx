"use client";

import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface FinaIconProps {
  className?: string;
}

export const FinaIcon: React.FC<FinaIconProps> = ({
  className = "w-4 h-4",
}) => {
  return (
    <div className={className}>
      <DotLottieReact
        src="https://lottie.host/835c5b9b-9acf-4d49-969c-4ff8ac375d40/l1qfZyT6bi.lottie"
        loop
        autoplay
      />
    </div>
  );
};
