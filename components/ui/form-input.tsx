import React from "react";
import { cn } from "@/lib/utils";

interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    { label, error, touched, required, onChange, onBlur, className, ...props },
    ref
  ) => {
    const hasError = touched && error;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#111827]">
          {label}
          {required && <span className="text-infina-red ml-1">*</span>}
        </label>

        <input
          ref={ref}
          className={cn(
            "flex h-auto w-full rounded-full border bg-[#F9FAFB] px-6 py-3 text-base text-[#111827]",
            "placeholder:text-[#9CA3AF]",
            hasError ? "border-infina-red" : "border-gray-300",
            hasError
              ? "focus:outline-none focus:bg-white focus:border-infina-red focus:ring-0"
              : "focus:outline-none focus:bg-white focus:border-infina-blue focus:ring-0",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
            "transition-all duration-200",
            "shadow-none",
            className
          )}
          onChange={handleChange}
          onBlur={onBlur}
          {...props}
        />

        {hasError && (
          <p className="text-sm text-infina-red flex items-center">
            <span className="mr-1">⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

interface FormSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      error,
      touched,
      required,
      options,
      placeholder,
      onChange,
      onBlur,
      className,
      ...props
    },
    ref
  ) => {
    const hasError = touched && error;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#111827]">
          {label}
          {required && <span className="text-infina-red ml-1">*</span>}
        </label>

        <select
          ref={ref}
          className={cn(
            "flex h-auto w-full rounded-full border bg-[#F9FAFB] px-6 py-3 text-base text-[#111827] cursor-pointer",
            hasError ? "border-infina-red" : "border-gray-300",
            hasError
              ? "focus:outline-none focus:bg-white focus:border-infina-red focus:ring-0"
              : "focus:outline-none focus:bg-white focus:border-infina-blue focus:ring-0",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
            "transition-all duration-200",
            "shadow-none",
            className
          )}
          onChange={handleChange}
          onBlur={onBlur}
          {...props}
        >
          {placeholder && (
            <option value="" className="text-[#9CA3AF]">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {hasError && (
          <p className="text-sm text-infina-red flex items-center">
            <span className="mr-1">⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";

interface FormTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  label: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(
  (
    { label, error, touched, required, onChange, onBlur, className, ...props },
    ref
  ) => {
    const hasError = touched && error;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#111827]">
          {label}
          {required && <span className="text-infina-red ml-1">*</span>}
        </label>

        <textarea
          ref={ref}
          className={cn(
            "flex w-full rounded-2xl border bg-[#F9FAFB] px-6 py-3 text-base text-[#111827]",
            "placeholder:text-[#9CA3AF]",
            hasError ? "border-infina-red" : "border-gray-300",
            hasError
              ? "focus:outline-none focus:bg-white focus:border-infina-red focus:ring-0"
              : "focus:outline-none focus:bg-white focus:border-infina-blue focus:ring-0",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
            "transition-all duration-200",
            "resize-vertical",
            "shadow-none",
            className
          )}
          onChange={handleChange}
          onBlur={onBlur}
          {...props}
        />

        {hasError && (
          <p className="text-sm text-infina-red flex items-center">
            <span className="mr-1">⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";
