"use client";

import { useAuth } from "@/hooks/auth/use-auth";
import { useChatFlow } from "@/hooks/use-chat-flow";
import { useOnboardingCheck } from "@/hooks/use-onboarding-check";
import { useAppTranslation } from "@/hooks/use-translation";
import { useImageUpload } from "@/hooks/use-image-upload";
import { ChatToolId } from "@/lib/types/ai-streaming.types";
import { redirect } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChatInput } from "./chat-input";
import { MessageList } from "./message-list";
import { SuggestionList } from "./suggestion-list";
import { ToolPanel } from "./tool-panel";
import { TypingIndicator } from "./typing-indicator";
import { aiService } from "@/lib/services/ai.service";

export function ChatInterface() {
  const { t } = useAppTranslation(["chat", "common"]);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();
  const sentFirstMessage = useRef(false);
  const { needsOnboarding, isLoading: isOnboardingLoading } =
    useOnboardingCheck();
  const [isGettingFirstMessage, setIsGettingFirstMessage] = useState(true);

  const chatFlow = useChatFlow();
  const {
    messages,
    isLoading: chatLoading,
    error,
    isThinking,
    isStreaming,
    isMCPLoading,
    mcpLoadingMessage,
    showSuggestions,
    clearError,
    toolId,
    setToolId,
    inputValue,
    setInputValue,
    handleSubmit: originalHandleSubmit,
    isSubmitting,
    suggestions,
    onSuggestionClick,
    conversationId,
    sendMessage,
  } = chatFlow;

  // Custom handler to ensure conversation exists before uploading
  const handleImageSelect = async (files: File[]) => {
    if (!conversationId) {
      alert(
        "Please send a message first to start a conversation before uploading images."
      );
      return;
    }

    // Upload the images
    await uploadImages(files);
  };

  // Use the image upload hook
  const {
    uploadedImages,
    isUploading,
    uploadImages,
    removeImage,
    clearImages,
    getImageUrls,
  } = useImageUpload({
    conversationId,
    onUploadComplete: (image) => {
      console.log("Image uploaded successfully:", image.name);
    },
    onUploadError: (image, error) => {
      console.error(`Failed to upload ${image.name}:`, error);
    },
  });

  // Custom handleSubmit that includes uploaded images
  const handleSubmit = async () => {
    try {
      // Get image URLs if any
      const imageUrls = getImageUrls();

      if (imageUrls.length > 0) {
        // Create a message with image URLs
        const imageUrlsText = imageUrls.join("\n");
        const messageWithImages = inputValue.trim()
          ? `${inputValue}\n\n[Attached images:\n${imageUrlsText}]`
          : `[Attached images:\n${imageUrlsText}]`;

        // Update input value with image URLs
        setInputValue(messageWithImages);
      }

      // Submit the message
      await originalHandleSubmit();

      // Clear images after successful submission
      clearImages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIsMobile();

    // Add event listener for resize
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    if (user && !sentFirstMessage.current) {
      const startConversation = async () => {
        setIsGettingFirstMessage(true);
        sendMessage(await aiService.getStartMessage(), {
          sender: "system",
        });
        setIsGettingFirstMessage(false);
      };
      sentFirstMessage.current = true;
      startConversation();
    }
  }, [user, sendMessage]);

  // Loading state
  if (chatLoading || isGettingFirstMessage) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-6">
            <div className="w-full h-full bg-blue-600 rounded-full animate-pulse"></div>
          </div>
          <p className="text-gray-600 font-nunito font-medium">
            {t("loading")}
          </p>
        </div>
      </div>
    );
  }

  if (needsOnboarding && !isOnboardingLoading) {
    return redirect("/onboarding");
  }

  // Determine if tool panel is open and adjust layout
  const isToolOpen = !!toolId && !isMobile;

  return (
    <div className="flex h-full bg-gray-50 p-0 md:p-8">
      {/* Main Chat Area - adjust width when tool panel is open on desktop */}
      <div
        className={`flex-1 flex flex-col ${
          isToolOpen ? "md:w-1/2 lg:w-3/5" : "w-full"
        }`}
        style={isToolOpen ? { maxWidth: isMobile ? "100%" : "60%" } : {}}
      >
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 p-6 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-red-400 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-nunito font-medium">
                  {error}
                </p>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800 text-sm font-nunito font-medium mt-2 cursor-pointer"
                >
                  {t("dismissError")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <MessageList
            messages={messages}
            onToolClick={(toolId) => setToolId(toolId as ChatToolId)}
            onSendMessage={sendMessage}
          />
          {isThinking && <TypingIndicator />}
          {isMCPLoading && (
            <div className="flex justify-start mb-6 px-6">
              <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-2xl rounded-bl-sm">
                <div className="w-4 h-4">
                  <div className="w-full h-full bg-blue-600 rounded-full animate-pulse"></div>
                </div>
                <span className="text-blue-700 font-nunito text-sm font-medium">
                  {mcpLoadingMessage}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="mb-2 p-4">
            <SuggestionList
              suggestions={suggestions}
              onSuggestionClick={onSuggestionClick}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          disabled={isThinking || isStreaming || isUploading}
          uploadedImages={uploadedImages}
          onRemoveImage={removeImage}
          onImageSelect={handleImageSelect}
        />
      </div>

      {/* Tool Panel */}
      <ToolPanel
        isOpen={!!toolId}
        toolId={toolId}
        onClose={() => {
          setToolId(null);
        }}
        chatFlowState={{
          messages,
          isLoading: chatLoading,
          error,
          isThinking,
          isStreaming,
          isMCPLoading,
          mcpLoadingMessage,
          showSuggestions,
          clearError,
          inputValue,
          setInputValue,
          sendMessage,
          handleSubmit,
          isSubmitting,
          suggestions,
          onSuggestionClick,
          conversationId,
        }}
      />
    </div>
  );
}
