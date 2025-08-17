"use client";

import { X, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { UploadedImage } from "@/lib/types/image-upload.types";
import { useAppTranslation } from "@/hooks/use-translation";

interface ImagePreviewProps {
  images: UploadedImage[];
  onRemove: (id: string) => void;
}

export function ImagePreview({ images, onRemove }: ImagePreviewProps) {
  const { t } = useAppTranslation(["chat"]);
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    // Create object URLs for files that need them
    const newUrls = new Map<string, string>();
    const urlsToRevoke: string[] = [];

    images.forEach((image) => {
      if (image.file && !image.url) {
        const url = URL.createObjectURL(image.file);
        newUrls.set(image.id, url);
        urlsToRevoke.push(url);
      } else if (image.url) {
        newUrls.set(image.id, image.url);
      }
    });

    setImageUrls(newUrls);

    // Cleanup function to revoke object URLs
    return () => {
      urlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  if (images.length === 0) return null;

  return (
    <div className="px-4 pt-2 pb-1">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-[#F0F2F5] border border-[#E0E0E0]"
          >
            {/* Image or Loading State */}
            {image.status === "uploading" ? (
              <div className="flex items-center justify-center w-full h-full">
                <Loader2 className="w-6 h-6 text-[#0055FF] animate-spin" />
              </div>
            ) : image.status === "error" ? (
              <div className="flex flex-col items-center justify-center w-full h-full p-2">
                <AlertCircle className="w-5 h-5 text-[#F44336] mb-1" />
                <span className="text-xs text-[#F44336] text-center font-nunito">
                  {t("uploadFailed")}
                </span>
              </div>
            ) : (
              imageUrls.get(image.id) && (
                <Image
                  src={imageUrls.get(image.id)!}
                  alt={image.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              )
            )}

            {/* Status Indicator */}
            {image.status === "success" && (
              <div className="absolute top-1 left-1">
                <div className="w-5 h-5 bg-[#2ECC71] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>
            )}

            {/* Remove Button */}
            {image.status !== "uploading" && (
              <Button
                onClick={() => onRemove(image.id)}
                size="icon"
                variant="destructive"
                className="absolute top-1 right-1 w-5 h-5 rounded-full"
                aria-label="Remove image"
              >
                <X className="w-3 h-3" />
              </Button>
            )}

            {/* File Name */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1 py-0.5 truncate font-nunito">
              {image.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
