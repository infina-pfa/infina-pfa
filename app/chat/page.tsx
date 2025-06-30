"use client";

import { AppLayout } from "@/components/ui/app-layout";
import { ChatInterface } from "@/components/chat/chat-interface";

export default function ChatPage() {
  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        <ChatInterface />
      </div>
    </AppLayout>
  );
}
