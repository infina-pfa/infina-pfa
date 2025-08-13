"use client";

import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { TFunction } from "i18next";

interface AuthFormFieldsProps {
  mode: "sign-in" | "sign-up";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onToggleShowPassword: () => void;
  onToggleShowConfirmPassword: () => void;
  t: TFunction;
}

export function AuthFormFields({
  mode,
  register,
  errors,
  showPassword,
  showConfirmPassword,
  onToggleShowPassword,
  onToggleShowConfirmPassword,
  t,
}: AuthFormFieldsProps) {
  return (
    <>
      {/* Email Field */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          {t("emailAddress")}
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            error={!!errors.email}
            className="pl-12"
            placeholder={t("enterEmail")}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">
            {t(errors.email.message as string)}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          {t("password")}
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            autoComplete="current-password"
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            error={!!errors.password}
            className="pl-12"
            placeholder={t("enterPassword")}
          />
          <button
            type="button"
            onClick={onToggleShowPassword}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-600 mt-1">
            {t(errors.password.message as string)}
          </p>
        )}
      </div>

      {/* Confirm Password Field (Sign Up Only) */}
      {mode === "sign-up" && (
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            {t("confirmPassword")}
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
              className="pl-12"
              placeholder={t("confirmPasswordPlaceholder")}
            />
            <button
              type="button"
              onClick={onToggleShowConfirmPassword}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 mt-1">
              {t(errors.confirmPassword.message as string)}
            </p>
          )}
        </div>
      )}
    </>
  );
}
