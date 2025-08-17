import { withAuth } from "@/lib/api/auth-wrapper";
import { NextResponse } from "next/server";

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

export const POST = withAuth<{ id: string }>(
  async (req, context) => {
    const { apiClient, params } = context;
    
    if (!params?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Conversation ID is required",
        },
        { status: 400 }
      );
    }

    try {
      // Parse form data
      const formData = await req.formData();
      const file = formData.get("image") as File;

      if (!file) {
        return NextResponse.json(
          {
            success: false,
            error: "No image file provided",
          },
          { status: 400 }
        );
      }

      // Validate file type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed",
          },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: "File size exceeds 10MB limit",
          },
          { status: 400 }
        );
      }

      // Convert file to FormData for backend API
      const backendFormData = new FormData();
      backendFormData.append("image", file);

      // Upload image using the backend API
      const response = await apiClient.post(
        `/ai-advisor/conversations/${params.id}/upload-image`,
        backendFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return NextResponse.json(response.data);
    } catch (error) {
      console.error("Image upload error:", error);
      
      // Check if it's an Axios error with response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            data?: { error?: string }; 
            status?: number 
          } 
        };
        return NextResponse.json(
          {
            success: false,
            error: axiosError.response?.data?.error || "Failed to upload image",
          },
          { status: axiosError.response?.status || 500 }
        );
      }
      
      return NextResponse.json(
        {
          success: false,
          error: "Internal server error",
        },
        { status: 500 }
      );
    }
  }
);