"use client";

import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number; // 0-100
  size?: number; // diameter in pixels
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
  children?: React.ReactNode;
  color?: string;
  backgroundColor?: string;
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  className,
  showPercentage = true,
  children,
  color = "#0055FF", // Infina primary blue
  backgroundColor = "#F0F2F5", // Infina light background
}: CircularProgressProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div 
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* Background circle */}
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ filter: 'drop-shadow(0 0 0 transparent)' }} // Ensure no shadows
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.8s ease-in-out',
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showPercentage && (
          <div className="text-center">
            <div 
              className="text-2xl font-bold"
              style={{ color, fontFamily: 'Nunito, sans-serif' }}
            >
              {Math.round(normalizedValue)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 