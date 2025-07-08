"use client";

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-6 px-6">
      <div className="flex items-start gap-4 max-w-[100%]">
        {/* Typing Animation */}
        <div className="flex flex-col items-start">
          <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-sm text-gray-500 mt-2 font-nunito">
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
