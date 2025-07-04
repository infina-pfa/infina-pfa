"use client";

interface MessageTimestampProps {
  timestamp: string;
  isUser: boolean;
}

export function MessageTimestamp({ timestamp, isUser }: MessageTimestampProps) {
  return (
    <div
      className={`text-sm text-gray-500 mt-2 font-nunito ${
        isUser ? "text-right" : "text-left"
      }`}
    >
      {new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </div>
  );
}
