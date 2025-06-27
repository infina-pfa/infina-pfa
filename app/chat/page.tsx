"use client";

import { useState } from "react";
import { Menu, ArrowLeft } from "lucide-react";
import { useConversationList } from "@/hooks/conversation/use-conversation-list";
import { useConversationMessages } from "@/hooks/message/use-message-list";
import { useConversationCreate } from "@/hooks/conversation/use-conversation-create";
import { useMessageCreate } from "@/hooks/message/use-message-create";
import { ConversationSidebar } from "@/components/chat/conversation-sidebar";
import { ChatArea } from "@/components/chat/chat-area";
import { EmptyState } from "@/components/chat/empty-state";
import { Header } from "@/components/ui/header";
import { Conversation } from "@/lib/types/conversation.types";

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    conversations,
    isLoading: loadingConversations,
    refetch: refetchConversations,
  } = useConversationList();
  const {
    messages,
    isLoading: loadingMessages,
    refetch: refetchMessages,
  } = useConversationMessages(selectedConversation?.id || null);
  const { createConversation, isCreating } = useConversationCreate();
  const { addUserMessage, isCreating: isSendingMessage } = useMessageCreate();

  const handleCreateConversation = async (title: string) => {
    const newConversation = await createConversation({ title });
    if (newConversation) {
      await refetchConversations();
      setSelectedConversation(newConversation);
      setIsSidebarOpen(false); // Close sidebar on mobile after creating
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsSidebarOpen(false); // Close sidebar on mobile after selecting
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return;

    const message = await addUserMessage(selectedConversation.id, content);
    if (message) {
      await refetchMessages();
    }
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-app-bg font-nunito">
      {/* Header for desktop navigation */}
      <Header />

      <div className="flex h-[calc(100vh-64px)] bg-[#F6F7F9] relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Conversation Sidebar */}
        <div
          className={`
          fixed md:static inset-y-0 left-0 z-50 
          w-full max-w-sm md:w-80 bg-white transform transition-transform duration-300 ease-in-out
          md:transform-none md:transition-none
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
        >
          <ConversationSidebar
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            onCreateConversation={handleCreateConversation}
            isLoading={loadingConversations}
            isCreating={isCreating}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedConversation ? (
            <>
              {/* Mobile Header */}
              <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center gap-3">
                <button
                  onClick={handleBackToConversations}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Menu size={20} />
                </button>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 truncate">
                    {selectedConversation.title}
                  </h2>
                </div>
              </div>

              <ChatArea
                conversation={selectedConversation}
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={loadingMessages}
                isSending={isSendingMessage}
                isMobile={true}
              />
            </>
          ) : (
            <>
              {/* Mobile Header for Empty State */}
              <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h1 className="text-lg font-semibold text-gray-900">
                  Infina Chat
                </h1>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Menu size={20} />
                </button>
              </div>

              <EmptyState
                onCreateConversation={handleCreateConversation}
                isMobile={true}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
