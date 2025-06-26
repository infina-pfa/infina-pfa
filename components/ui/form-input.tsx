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
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <input
          ref={ref}
          className={cn(
            "w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "transition-colors duration-200",
            hasError
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            className
          )}
          onChange={handleChange}
          onBlur={onBlur}
          {...props}
        />

        {hasError && (
          <p className="text-sm text-red-500 flex items-center">
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
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <select
          ref={ref}
          className={cn(
            "w-full px-3 py-2 border rounded-md shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "transition-colors duration-200",
            hasError
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            className
          )}
          onChange={handleChange}
          onBlur={onBlur}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {hasError && (
          <p className="text-sm text-red-500 flex items-center">
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
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <textarea
          ref={ref}
          className={cn(
            "w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "transition-colors duration-200 resize-vertical",
            hasError
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            className
          )}
          onChange={handleChange}
          onBlur={onBlur}
          {...props}
        />

        {hasError && (
          <p className="text-sm text-red-500 flex items-center">
            <span className="mr-1">⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";
