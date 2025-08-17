import { useState, useCallback } from "react";
import { UploadedImage } from "@/lib/types/image-upload.types";
import { chatService } from "@/lib/services/chat.service";

interface UseImageUploadOptions {
  conversationId: string | null;
  onUploadComplete?: (image: UploadedImage) => void;
  onUploadError?: (image: UploadedImage, error: Error) => void;
  maxFileSize?: number;
  allowedMimeTypes?: string[];
}

interface UseImageUploadReturn {
  uploadedImages: UploadedImage[];
  isUploading: boolean;
  uploadImages: (files: File[]) => Promise<void>;
  removeImage: (imageId: string) => void;
  clearImages: () => void;
  getSuccessfulImages: () => UploadedImage[];
  getImageUrls: () => string[];
  hasImages: boolean;
  hasSuccessfulImages: boolean;
}

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

export function useImageUpload(
  options: UseImageUploadOptions
): UseImageUploadReturn {
  const {
    conversationId,
    onUploadComplete,
    onUploadError,
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    allowedMimeTypes = DEFAULT_ALLOWED_MIME_TYPES,
  } = options;

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImages = useCallback(
    async (files: File[]) => {
      if (!conversationId) {
        console.error("No conversation ID available for image upload");
        return;
      }

      // Validate files
      const validFiles = files.filter((file) => {
        if (!allowedMimeTypes.includes(file.type)) {
          console.error(`Invalid file type: ${file.type}`);
          return false;
        }
        if (file.size > maxFileSize) {
          console.error(`File too large: ${file.name} (${file.size} bytes)`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        return;
      }

      setIsUploading(true);

      // Create temporary upload entries
      const newImages: UploadedImage[] = validFiles.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        mimeType: file.type,
        status: "uploading" as const,
      }));

      setUploadedImages((prev) => [...prev, ...newImages]);

      // Upload each image
      const uploadPromises = newImages.map(async (image) => {
        try {
          const result = await chatService.uploadImage(
            conversationId,
            image.file!
          );

          // Update the image with success status and URL
          const successImage: UploadedImage = {
            ...image,
            status: "success" as const,
            url: result.publicUrl,
            file: undefined, // Clear the file object to free memory
          };

          setUploadedImages((prev) =>
            prev.map((img) => (img.id === image.id ? successImage : img))
          );

          if (onUploadComplete) {
            onUploadComplete(successImage);
          }

          return successImage;
        } catch (error) {
          console.error(`Failed to upload ${image.name}:`, error);

          // Update the image with error status
          const errorImage: UploadedImage = {
            ...image,
            status: "error" as const,
            error: error instanceof Error ? error.message : "Upload failed",
          };

          setUploadedImages((prev) =>
            prev.map((img) => (img.id === image.id ? errorImage : img))
          );

          if (onUploadError) {
            onUploadError(errorImage, error as Error);
          }

          return errorImage;
        }
      });

      await Promise.all(uploadPromises);
      setIsUploading(false);
    },
    [
      conversationId,
      maxFileSize,
      allowedMimeTypes,
      onUploadComplete,
      onUploadError,
    ]
  );

  const removeImage = useCallback((imageId: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
  }, []);

  const clearImages = useCallback(() => {
    setUploadedImages([]);
  }, []);

  const getSuccessfulImages = useCallback(() => {
    return uploadedImages.filter((img) => img.status === "success");
  }, [uploadedImages]);

  const getImageUrls = useCallback(() => {
    return getSuccessfulImages()
      .map((img) => img.url)
      .filter((url): url is string => url !== undefined);
  }, [getSuccessfulImages]);

  const hasImages = uploadedImages.length > 0;
  const hasSuccessfulImages = getSuccessfulImages().length > 0;

  return {
    uploadedImages,
    isUploading:
      isUploading || uploadedImages.some((img) => img.status === "uploading"),
    uploadImages,
    removeImage,
    clearImages,
    getSuccessfulImages,
    getImageUrls,
    hasImages,
    hasSuccessfulImages,
  };
}
