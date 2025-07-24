"use client";

import { Card } from "@/components/ui/card";
import { useAppTranslation } from "@/hooks/use-translation";
import { useRef, useState } from "react";

interface VideoMessageProps {
  videoURL: string;
}

export const VideoMessage = ({ videoURL }: VideoMessageProps) => {
  const { t } = useAppTranslation(["common", "chat"]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((err) => {
        setError(t("videoPlayError", { ns: "chat" }));
        console.error("Video play error:", err);
      });
    }
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
    setError(null);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleVideoError = () => {
    setError(t("videoLoadError", { ns: "chat" }));
    setIsPlaying(false);
  };

  if (error) {
    return (
      <Card className="w-full overflow-hidden bg-white rounded-lg p-4">
        <div className="text-center text-red-500 p-3 text-sm">{error}</div>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden bg-white rounded-lg p-4">
      <div className="relative group">
        <video
          ref={videoRef}
          className="w-full h-auto rounded-lg bg-gray-100"
          controls
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          onError={handleVideoError}
          onClick={handlePlayPause}
          preload="metadata"
          style={{ maxHeight: "300px" }}
        >
          <source src={videoURL} type="video/mp4" />
          <source src={videoURL} type="video/webm" />
          <source src={videoURL} type="video/ogg" />
          {t("videoNotSupported", { ns: "chat" })}
        </video>

        {/* Video Controls Overlay */}

        {/* Video Info */}
        <div className="mt-3">
          <p className="text-sm text-gray-500 font-nunito">
            {t("clickToPlay", { ns: "chat" })}
          </p>
        </div>
      </div>
    </Card>
  );
};
