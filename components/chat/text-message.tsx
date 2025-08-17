"use client";

import { ChatMessage } from "@/lib/types/chat.types";
import { MarkdownMessage } from "./markdown-message";
import Image from "next/image";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface TextMessageProps {
  message: ChatMessage;
  isUser: boolean;
}

export function TextMessage({ message, isUser }: TextMessageProps) {
  const metadata = message.metadata as { imageUrls?: string[] };
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set());

  // Extract image URLs from metadata
  const imageUrls = metadata?.imageUrls || [];

  const handleImageLoad = (url: string) => {
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(url);
      return newSet;
    });
  };

  const handleImageError = (url: string) => {
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(url);
      return newSet;
    });
    setErrorImages(prev => new Set(prev).add(url));
  };

  return (
    <div>
      {/* Text content */}
      <div
        className={`
          px-4 py-3 rounded-2xl max-w-full font-nunito text-base
          ${
            isUser
              ? "bg-blue-600 text-white rounded-br-sm"
              : "bg-gray-100 text-gray-900 rounded-bl-sm"
          }
        `}
      >
        {isUser ? (
          <span>{message.content}</span>
        ) : (
          <MarkdownMessage
            content={message.streamingContent || message.content || ""}
            isUser={false}
          />
        )}
      </div>

      {/* Images below the content - Optimized for mobile */}
      {imageUrls.length > 0 && (
        <div className={`
          mt-2 grid gap-2
          ${imageUrls.length === 1 
            ? "grid-cols-1" 
            : imageUrls.length === 2 
            ? "grid-cols-2" 
            : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
          }
          max-w-full sm:max-w-md md:max-w-lg
        `}>
          {imageUrls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className={`
                relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200
                ${imageUrls.length === 1 
                  ? "aspect-[4/3] max-w-sm mx-auto w-full" 
                  : "aspect-square w-full"
                }
              `}
            >
              {!errorImages.has(url) && (
                <>
                  {loadingImages.has(url) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                    </div>
                  )}
                  <Image
                    src={url}
                    alt={`Uploaded image ${index + 1}`}
                    fill
                    sizes={imageUrls.length === 1 
                      ? "(max-width: 640px) 100vw, (max-width: 768px) 80vw, 400px"
                      : "(max-width: 640px) 50vw, (max-width: 768px) 33vw, 150px"
                    }
                    className="object-cover cursor-pointer hover:opacity-90 active:opacity-80 transition-opacity"
                    unoptimized
                    onLoad={() => handleImageLoad(url)}
                    onError={() => handleImageError(url)}
                    onClick={() => window.open(url, "_blank")}
                  />
                </>
              )}
              {errorImages.has(url) && (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs sm:text-sm p-2 text-center">
                  Failed to load image
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
