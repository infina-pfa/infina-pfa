"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

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
      {/* Header - following landing page design */}
      <div className="text-center space-y-6">
        <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] leading-tight">
          {t("nameStepTitle")}
        </h1>
      </div>

      {/* Name Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={t("namePlaceholder")}
            className="h-12 text-base"
            disabled={loading}
            autoFocus
          />
          {showError && <p className="text-[#F44336] text-sm mt-1">{error}</p>}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full py-6 text-base cursor-pointer"
          disabled={loading || !name.trim()}
        >
          {loading ? t("creatingProfile") : t("getStartedButton")}
          {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
        </Button>
      </form>
    </div>
  );
}
