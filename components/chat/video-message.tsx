"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAppTranslation } from "@/hooks/use-translation";
import { Play, Pause, Maximize, Minimize } from "lucide-react";

interface VideoMessageProps {
  videoURL: string;
}

export const VideoMessage = ({ videoURL }: VideoMessageProps) => {
  const { t } = useAppTranslation(["common", "chat"]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  const handleFullscreen = () => {
    if (!videoRef.current) return;

    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ("webkitRequestFullscreen" in videoRef.current) {
        (
          videoRef.current as HTMLVideoElement & {
            webkitRequestFullscreen(): void;
          }
        ).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ("webkitExitFullscreen" in document) {
        (
          document as Document & { webkitExitFullscreen(): void }
        ).webkitExitFullscreen();
      }
    }
  };

  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  // Handle fullscreen change events
  if (typeof window !== "undefined") {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
  }

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
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-20 rounded-lg">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              onClick={handlePlayPause}
              className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200"
              aria-label={
                isPlaying
                  ? t("pause", { ns: "common" })
                  : t("play", { ns: "common" })
              }
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-gray-800" />
              ) : (
                <Play className="w-6 h-6 text-gray-800 ml-0.5" />
              )}
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={handleFullscreen}
              className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200"
              aria-label={
                isFullscreen
                  ? t("exitFullscreen", { ns: "common" })
                  : t("fullscreen", { ns: "common" })
              }
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 text-gray-800" />
              ) : (
                <Maximize className="w-4 h-4 text-gray-800" />
              )}
            </button>
          </div>
        </div>

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
