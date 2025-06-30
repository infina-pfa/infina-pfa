"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Note: Using simple label element instead of Label component
import { ArrowRight, User } from "lucide-react";

interface NameStepProps {
  name: string;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}

export function NameStep({
  name,
  onNameChange,
  onSubmit,
  loading,
  error,
}: NameStepProps) {
  const { t } = useTranslation();
  const [touched, setTouched] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    onSubmit();
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const showError = touched && error;

  return (
    <div className="max-w-lg mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-[#F0F2F5] rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-[#0055FF]" />
        </div>
        <h1 className="text-3xl font-bold text-[#111827] font-nunito">
          {t("nameStepTitle")}
        </h1>
        <p className="text-xl text-[#6B7280] font-nunito">
          {t("nameStepSubtitle")}
        </p>
        <p className="text-[#6B7280] leading-relaxed font-nunito">
          {t("nameStepDescription")}
        </p>
      </div>

      {/* Name Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-base font-medium text-[#111827] block font-nunito"
          >
            {t("nameLabel")}
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={t("namePlaceholder")}
            className="h-12 text-base font-nunito"
            disabled={loading}
            autoFocus
          />
          {showError && (
            <p className="text-[#F44336] text-sm mt-1 font-nunito">{error}</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full py-6 text-base cursor-pointer font-nunito"
          disabled={loading || !name.trim()}
        >
          {loading ? t("creatingProfile") : t("getStartedButton")}
          {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
        </Button>
      </form>
    </div>
  );
}
