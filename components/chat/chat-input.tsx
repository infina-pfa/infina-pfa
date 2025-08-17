"use client";

import { useRef, useEffect, useState } from "react";
import { useAppTranslation } from "@/hooks/use-translation";
import { Plus, Mic, Send, Image as ImageIcon, FileText } from "lucide-react";
import { ImagePreview } from "./image-preview";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UploadedImage } from "@/lib/types/image-upload.types";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  disabled?: boolean;
  onAttachFile?: () => void;
  onVoiceInput?: () => void;
  uploadedImages?: UploadedImage[];
  onRemoveImage?: (imageId: string) => void;
  onImageSelect?: (files: File[]) => void;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  disabled = false,
  onAttachFile,
  onVoiceInput,
  uploadedImages = [],
  onRemoveImage,
  onImageSelect,
}: ChatInputProps) {
  const { t } = useAppTranslation(["chat", "common"]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [charCount, setCharCount] = useState<number>(0);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const maxLength = 500;

  // Auto-resize textarea and update character count
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
    setCharCount(value.length);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    // Enforce character limit
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isSubmitting && !disabled) {
        onSubmit();
      }
    }
  };

  const handleSubmit = () => {
    const hasUploadedImages = uploadedImages.some(img => img.status === "success");
    if ((value.trim() || hasUploadedImages) && !isSubmitting && !disabled) {
      onSubmit();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && onImageSelect) {
      const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      );
      onImageSelect(imageFiles);
    }
    setShowAttachMenu(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (imageId: string) => {
    if (onRemoveImage) {
      onRemoveImage(imageId);
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const isOverLimit = charCount > maxLength;
  const isNearLimit = charCount >= maxLength * 0.9 && charCount <= maxLength;

  return (
    <div className="bg-white rounded-xl mx-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* Image preview */}
      {uploadedImages.length > 0 && (
        <ImagePreview
          images={uploadedImages}
          onRemove={handleRemoveImage}
        />
      )}

      {/* Text Input Row */}
      <div className="px-4 pt-4 pb-1">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={t("inputPlaceholder") || "Message"}
          disabled={disabled || isSubmitting}
          maxLength={maxLength}
          className={`
            w-full resize-none bg-transparent outline-none font-nunito text-base
            placeholder-gray-400 text-gray-900 min-h-[24px] max-h-[120px]
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        />

        {/* Character counter */}
        <div
          className={`text-xs text-right mt-1 ${
            isOverLimit
              ? "text-[#F44336]"
              : isNearLimit
              ? "text-[#FFC107]"
              : "text-gray-400"
          }`}
        >
          {charCount}/{maxLength}
        </div>
      </div>

      {/* Tools Row */}
      <div className="flex items-center justify-between px-4 pb-4">
        {/* Add/Attach Button with Dropdown */}
        <DropdownMenu open={showAttachMenu} onOpenChange={setShowAttachMenu}>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="default"
              disabled={disabled || isSubmitting}
              aria-label={t("attachFile")}
            >
              <Plus
                className={`w-5 h-5 ${showAttachMenu ? "rotate-45" : ""} transition-transform`}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="mb-2">
            <DropdownMenuItem onClick={handleImageButtonClick}>
              <ImageIcon className="w-4 h-4" />
              <span>{t("uploadImage")}</span>
            </DropdownMenuItem>
            {onAttachFile && (
              <DropdownMenuItem onClick={onAttachFile}>
                <FileText className="w-4 h-4" />
                <span>{t("attachFile")}</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Voice/Send Button */}
        <Button
          size="icon"
          variant="default"
          onClick={(value.trim() || uploadedImages.some(img => img.status === "success")) ? handleSubmit : onVoiceInput}
          disabled={disabled || isSubmitting || isOverLimit || uploadedImages.some(img => img.status === "uploading")}
          aria-label={(value.trim() || uploadedImages.some(img => img.status === "success")) ? t("sendMessage") : t("voiceInput")}
        >
          {isSubmitting ? (
            <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
          ) : (value.trim() || uploadedImages.some(img => img.status === "success")) ? (
            <Send className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
