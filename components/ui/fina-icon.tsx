"use client";

import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";

export interface FinaIconProps {
  className?: string;
  name?: string;
  style?: React.CSSProperties;
}

export const FinaIcon: React.FC<FinaIconProps> = ({
  className = "w-4 h-4",
  name,
  style,
}) => {
  // If name is provided, render a Lucide icon
  if (name && Object.prototype.hasOwnProperty.call(LucideIcons, name)) {
    const IconComponent = LucideIcons[
      name as keyof typeof LucideIcons
    ] as LucideIcon;
    return <IconComponent className={className} style={style} />;
  }

  // Default to the lottie animation
  return (
    <div className={className} style={style}>
      <DotLottieReact
        src="https://lottie.host/835c5b9b-9acf-4d49-969c-4ff8ac375d40/l1qfZyT6bi.lottie"
        loop
        autoplay
      />
    </div>
  );
};
