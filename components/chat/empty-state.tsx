"use client";

import { useState } from "react";
import { MessageCircle, Plus, Sparkles } from "lucide-react";

interface EmptyStateProps {
  onCreateConversation: (title: string) => void;
  isMobile?: boolean;
}

export const EmptyState = ({
  onCreateConversation,
  isMobile = false,
}: EmptyStateProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onCreateConversation(title.trim());
    setTitle("");
    setIsCreating(false);
  };

  const suggestedTopics = [
    "Financial planning advice",
    "Budget optimization tips",
    "Investment strategies",
    "Expense tracking help",
    "Savings goals planning",
    "Debt management advice",
  ];

  const handleSuggestedClick = (topic: string) => {
    onCreateConversation(topic);
  };

  return (
    <div className="flex items-center justify-center h-full bg-[#F6F7F9]">
      <div className={`max-w-md text-center ${isMobile ? "p-4 px-6" : "p-8"}`}>
        {/* Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-[#0055FF]/10 rounded-full flex items-center justify-center mx-auto">
            <MessageCircle size={40} className="text-[#0055FF]" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#2ECC71] rounded-full flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
        </div>

        {/* Title and Description */}
        <h2
          className={`${
            isMobile ? "text-xl" : "text-2xl"
          } font-semibold text-gray-900 mb-3`}
        >
          Welcome to Infina Chat
        </h2>
        <p className={`text-gray-600 ${isMobile ? "mb-6 text-sm" : "mb-8"}`}>
          Start a conversation to get personalized financial advice and
          insights. Your AI assistant is ready to help you manage your finances
          better.
        </p>

        {!isCreating ? (
          <div className="space-y-6">
            {/* Quick Start Button */}
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-3 px-6 bg-[#0055FF] text-white rounded-xl font-medium hover:bg-[#0055FF]/90 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Start New Conversation
            </button>

            {/* Suggested Topics */}
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Or choose a topic to get started:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {suggestedTopics.map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedClick(topic)}
                    className="px-4 py-3 text-left text-sm text-gray-700 bg-white rounded-lg hover:bg-[#0055FF]/5 hover:text-[#0055FF] transition-colors border border-gray-100"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What would you like to discuss?"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0055FF]/20 focus:border-[#0055FF]"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!title.trim()}
                className="flex-1 py-3 bg-[#0055FF] text-white rounded-xl font-medium hover:bg-[#0055FF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Start Chat
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setTitle("");
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Features */}
        <div
          className={`${
            isMobile ? "mt-8" : "mt-12"
          } grid grid-cols-1 gap-4 text-left`}
        >
          <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
            <div className="w-8 h-8 bg-[#2ECC71]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="text-[#2ECC71]" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 text-sm">
                Personalized Advice
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                Get tailored financial recommendations based on your data
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
            <div className="w-8 h-8 bg-[#0055FF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageCircle size={16} className="text-[#0055FF]" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 text-sm">
                Natural Conversations
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                Chat naturally about your financial goals and concerns
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
