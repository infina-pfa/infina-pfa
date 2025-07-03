"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useAppTranslation } from "@/hooks/use-translation";

interface OnboardingChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export function OnboardingChatInput({
  onSendMessage,
  disabled = false,
  placeholder,
}: OnboardingChatInputProps) {
  const { t } = useAppTranslation(["onboarding", "common"]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || disabled || isSending) return;

    const message = inputValue.trim();
    setInputValue("");
    setIsSending(true);

    try {
      await onSendMessage(message);
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore the message if sending failed
      setInputValue(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2 items-end">
      <div className="flex-1">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder || t("typeYourMessage")}
          disabled={disabled || isSending}
          className="h-12 text-base"
        />
      </div>
      
      <Button
        type="submit"
        disabled={!inputValue.trim() || disabled || isSending}
        className="h-12 px-4 bg-[#0055FF] hover:bg-blue-700 text-white"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
} 