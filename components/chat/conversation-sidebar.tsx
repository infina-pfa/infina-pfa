"use client";

import { useState } from "react";
import { Plus, MessageCircle, Search, X } from "lucide-react";
import { Conversation } from "@/lib/types/conversation.types";

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onCreateConversation: (title: string) => void;
  isLoading: boolean;
  isCreating: boolean;
  onClose?: () => void;
}

export const ConversationSidebar = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  onCreateConversation,
  isLoading,
  isCreating,
  onClose,
}: ConversationSidebarProps) => {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await onCreateConversation(newTitle.trim());
    setNewTitle("");
    setIsCreatingNew(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-6 bg-[#F0F2F5]">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h1 className="text-lg md:text-xl font-semibold text-gray-900">
            Conversations
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingNew(true)}
              disabled={isCreating}
              className="p-2 text-[#0055FF] hover:bg-[#0055FF]/10 rounded-lg transition-colors"
            >
              <Plus size={20} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0055FF]/20"
          />
        </div>
      </div>

      {/* New Conversation Form */}
      {isCreatingNew && (
        <div className="p-4 bg-[#F0F2F5] border-t border-gray-200">
          <form onSubmit={handleCreateSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Conversation title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0055FF]/20"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!newTitle.trim() || isCreating}
                className="flex-1 py-2 bg-[#0055FF] text-white rounded-lg text-sm font-medium hover:bg-[#0055FF]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(false);
                  setNewTitle("");
                }}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-100 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm">
              {searchTerm ? "No conversations found" : "No conversations yet"}
            </p>
            {!searchTerm && (
              <p className="text-xs mt-1">
                Start a new conversation to get started
              </p>
            )}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`w-full p-3 text-left rounded-lg transition-colors ${
                  selectedConversation?.id === conversation.id
                    ? "bg-[#0055FF]/10 text-[#0055FF]"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-medium text-sm truncate pr-2">
                    {conversation.title}
                  </h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(conversation.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-500">
                    Created {formatDate(conversation.created_at)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
