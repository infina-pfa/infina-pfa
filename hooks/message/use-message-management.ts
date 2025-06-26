import { useCallback } from "react";
import { useMessageList, useConversationMessages } from "./use-message-list";
import { useMessageCreate } from "./use-message-create";
import { useMessageUpdate } from "./use-message-update";
import { useMessageDelete } from "./use-message-delete";
import { useMessageSummary } from "./use-message-summary";
import {
  CreateMessageRequest,
  UpdateMessageRequest,
  GetMessagesQuery,
} from "@/lib/types/message.types";

export const useMessageManagement = (query?: GetMessagesQuery) => {
  const list = useMessageList(query);
  const create = useMessageCreate();
  const update = useMessageUpdate();
  const remove = useMessageDelete();
  const summary = useMessageSummary(query);

  const handleCreateMessage = useCallback(
    async (data: CreateMessageRequest) => {
      const result = await create.createMessage(data);
      if (result) {
        list.refetch();
        summary.refetch();
      }
      return result;
    },
    [create, list, summary]
  );

  const handleAddUserMessage = useCallback(
    async (
      conversationId: string,
      content: string,
      metaData?: Record<string, unknown>
    ) => {
      const result = await create.addUserMessage(conversationId, content, metaData);
      if (result) {
        list.refetch();
        summary.refetch();
      }
      return result;
    },
    [create, list, summary]
  );

  const handleAddBotMessage = useCallback(
    async (
      conversationId: string,
      content: string,
      metaData?: Record<string, unknown>
    ) => {
      const result = await create.addBotMessage(conversationId, content, metaData);
      if (result) {
        list.refetch();
        summary.refetch();
      }
      return result;
    },
    [create, list, summary]
  );

  const handleUpdateMessage = useCallback(
    async (id: string, data: UpdateMessageRequest) => {
      const result = await update.updateMessage(id, data);
      if (result) {
        list.refetch();
        summary.refetch();
      }
      return result;
    },
    [update, list, summary]
  );

  const handleDeleteMessage = useCallback(
    async (id: string) => {
      const result = await remove.deleteMessage(id);
      if (result) {
        list.refetch();
        summary.refetch();
      }
      return result;
    },
    [remove, list, summary]
  );

  return {
    list,
    create: {
      ...create,
      createMessage: handleCreateMessage,
      addUserMessage: handleAddUserMessage,
      addBotMessage: handleAddBotMessage,
    },
    update: {
      ...update,
      updateMessage: handleUpdateMessage,
    },
    delete: {
      ...remove,
      deleteMessage: handleDeleteMessage,
    },
    summary,
  };
};

export const useConversationMessageManagement = (
  conversationId: string | null,
  options?: { limit?: number; offset?: number }
) => {
  const messages = useConversationMessages(conversationId, options);
  const create = useMessageCreate();
  const update = useMessageUpdate();
  const remove = useMessageDelete();

  const handleAddUserMessage = useCallback(
    async (content: string, metaData?: Record<string, unknown>) => {
      if (!conversationId) return null;
      
      const result = await create.addUserMessage(conversationId, content, metaData);
      if (result) {
        messages.refetch();
      }
      return result;
    },
    [conversationId, create, messages]
  );

  const handleAddBotMessage = useCallback(
    async (content: string, metaData?: Record<string, unknown>) => {
      if (!conversationId) return null;
      
      const result = await create.addBotMessage(conversationId, content, metaData);
      if (result) {
        messages.refetch();
      }
      return result;
    },
    [conversationId, create, messages]
  );

  const handleUpdateMessage = useCallback(
    async (id: string, data: UpdateMessageRequest) => {
      const result = await update.updateMessage(id, data);
      if (result) {
        messages.refetch();
      }
      return result;
    },
    [update, messages]
  );

  const handleDeleteMessage = useCallback(
    async (id: string) => {
      const result = await remove.deleteMessage(id);
      if (result) {
        messages.refetch();
      }
      return result;
    },
    [remove, messages]
  );

  return {
    messages,
    addUserMessage: handleAddUserMessage,
    addBotMessage: handleAddBotMessage,
    updateMessage: handleUpdateMessage,
    deleteMessage: handleDeleteMessage,
    isCreating: create.isCreating,
    isUpdating: update.isUpdating,
    isDeleting: remove.isDeleting,
    createError: create.error,
    updateError: update.error,
    deleteError: remove.error,
  };
}; 