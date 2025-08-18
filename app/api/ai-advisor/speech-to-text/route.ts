import { withAuth } from "@/lib/api/auth-wrapper";
import { SpeechToTextResponse } from "@/lib/types/chat.types";
import { NextResponse } from "next/server";

export const POST = withAuth(async (req, context) => {
  const { apiClient } = context;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validAudioTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/wave",
      "audio/x-wav",
      "audio/m4a",
      "audio/x-m4a",
      "audio/mp4",
      "audio/webm",
      "audio/ogg",
      "audio/flac",
    ];

    if (!validAudioTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an audio file." },
        { status: 400 }
      );
    }

    const maxFileSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: "File size exceeds 25MB limit" },
        { status: 400 }
      );
    }

    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const response = await apiClient.post<{ data: SpeechToTextResponse }>(
      "/ai-advisor/speech-to-text",
      backendFormData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Speech-to-text error:", error);
    throw error;
  }
});
