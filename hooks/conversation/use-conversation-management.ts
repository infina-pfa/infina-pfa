import { useCallback } from "react";
import { useConversationList } from "./use-conversation-list";
import { useConversationCreate } from "./use-conversation-create";
import { useConversationUpdate } from "./use-conversation-update";
import { useConversationDelete } from "./use-conversation-delete";
import { useConversationSummary } from "./use-conversation-summary";
import {
  CreateConversationRequest,
  UpdateConversationRequest,
  GetConversationsQuery,
} from "@/lib/types/conversation.types";

export const useConversationManagement = (query?: GetConversationsQuery) => {
  const list = useConversationList(query);
  const create = useConversationCreate();
  const update = useConversationUpdate();
  const remove = useConversationDelete();
  const summary = useConversationSummary(query);

  const handleCreateConversation = useCallback(
    async (data: CreateConversationRequest) => {
      const result = await create.createConversation(data);
      if (result) {
        list.refetch();
        summary.refetch();
      }
      return result;
    },
    [create, list, summary]
  );

  const handleUpdateConversation = useCallback(
    async (id: string, data: UpdateConversationRequest) => {
      const result = await update.updateConversation(id, data);
      if (result) {
        list.refetch();
        summary.refetch();
      }
      return result;
    },
    [update, list, summary]
  );

  const handleSoftDeleteConversation = useCallback(
    async (id: string) => {
      const result = await remove.softDeleteConversation(id);
      if (result) {
        list.refetch();
        summary.refetch();
      }
      return result;
    },
    [remove, list, summary]
  );

  const handleRestoreConversation = useCallback(
    async (id: string) => {
      const result = await remove.restoreConversation(id);
      if (result) {
        list.refetch();
        summary.refetch();
      }
      return result;
    },
    [remove, list, summary]
  );

  const handleHardDeleteConversation = useCallback(
    async (id: string) => {
      const result = await remove.hardDeleteConversation(id);
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
      createConversation: handleCreateConversation,
    },
    update: {
      ...update,
      updateConversation: handleUpdateConversation,
    },
    delete: {
      ...remove,
      softDeleteConversation: handleSoftDeleteConversation,
      restoreConversation: handleRestoreConversation,
      hardDeleteConversation: handleHardDeleteConversation,
    },
    summary,
  };
}; 