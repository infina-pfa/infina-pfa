"use client";

import { useRef, useState, useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiService } from "@/lib/services/ai.service";
import { toast } from "sonner";
import { useAppTranslation } from "@/hooks/use-translation";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceRecorder({
  onTranscription,
  disabled = false,
  className = "",
}: VoiceRecorderProps) {
  const { t } = useAppTranslation(["chat"]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await transcribeAudio(audioBlob);

        // Clean up
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error(t("recordingError") || "Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Clear duration timer
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      // Convert blob to File for the API
      const audioFile = new File([audioBlob], "recording.webm", {
        type: "audio/webm",
      });

      const result = await aiService.speechToText(audioFile);

      if (result.text) {
        onTranscription(result.text);
        toast.success(
          t("transcriptionSuccess") || "Voice transcribed successfully"
        );
      } else {
        toast.error(t("noSpeechDetected") || "No speech detected");
      }
    } catch (error) {
      console.error("Transcription error:", error);
      toast.error(t("transcriptionError") || "Failed to transcribe audio");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return (
    <div className={className}>
      {/* Voice Button */}
      <Button
        size="icon"
        variant="default"
        onClick={handleClick}
        disabled={disabled || isTranscribing}
        aria-label={isRecording ? t("stopRecording") : t("voiceInput")}
        className={isRecording ? "bg-[#F44336] hover:bg-[#D32F2F]" : ""}
      >
        {isTranscribing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isRecording ? (
          <Square className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
}
