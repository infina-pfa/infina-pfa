import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  formatNumber,
  parseFormattedNumber,
} from "@/lib/validation/input-validation";

interface NumberInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  label: string;
  value: string | number;
  error?: string;
  touched?: boolean;
  required?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      label,
      value,
      error,
      touched,
      required,
      onChange,
      onBlur,
      className,
      ...props
    },
    ref
  ) => {
    const hasError = touched && error;
    const [displayValue, setDisplayValue] = useState<string>("");
    const [isEditing, setIsEditing] = useState<boolean>(false);

    // Format the value with thousand separators when it changes (but not during editing)
    useEffect(() => {
      if (!isEditing) {
        if (value || value === 0) {
          const numericValue =
            typeof value === "string" ? parseFormattedNumber(value) : value;
          setDisplayValue(numericValue >= 0 ? formatNumber(numericValue) : "");
        } else {
          setDisplayValue("");
        }
      }
    }, [value, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Allow empty input
      if (!inputValue) {
        onChange?.("");
        setDisplayValue("");
        return;
      }

      // Strip all non-numeric characters for processing
      const numericValue = inputValue.replace(/[^\d]/g, "");

      // Pass the numeric string to parent component
      onChange?.(numericValue);

      // During editing, show the raw input without formatting
      if (isEditing) {
        setDisplayValue(numericValue);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsEditing(true);

      // When focused, show only the numeric value without formatting
      const numericValue = value
        ? typeof value === "string"
          ? value
          : value.toString()
        : "";

      // Remove any formatting
      const cleanValue = numericValue.replace(/[^\d]/g, "");
      setDisplayValue(cleanValue);

      // Select all text for easy editing
      setTimeout(() => e.target.select(), 0);
    };

    const handleBlur = () => {
      setIsEditing(false);

      // When blurred, format the value with thousand separators if it's not empty
      if (value || value === 0) {
        const numericValue =
          typeof value === "string" ? parseFormattedNumber(value) : value;
        setDisplayValue(numericValue >= 0 ? formatNumber(numericValue) : "");
      } else {
        setDisplayValue("");
      }

      onBlur?.();
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#111827]">
          {label}
          {required && <span className="text-[#F44336] ml-1">*</span>}
        </label>

        <input
          ref={ref}
          className={cn(
            "flex h-12 w-full bg-transparent px-4 py-4 text-base font-normal text-[#111827]",
            "font-[Nunito] leading-6",
            "border border-transparent border-b-[#E5E7EB] border-b",
            "rounded-none",
            "placeholder:text-[#9CA3AF]",
            hasError
              ? "border-b-[#F44336] focus:border-b-[#F44336]"
              : "focus:outline-none focus:border-b-2 focus:border-b-[#0055FF]",
            "disabled:cursor-not-allowed disabled:text-[#9CA3AF] disabled:border-b-[#E5E7EB]",
            "transition-all duration-200",
            "shadow-none",
            "text-right",
            className
          )}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          inputMode="numeric"
          {...props}
        />

        {hasError && (
          <p className="text-sm text-[#F44336] flex items-center mt-1">
            <span className="mr-1">⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";
