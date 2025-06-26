import { useState } from "react";
import { conversationService } from "@/lib/services/conversation.service";
import { handleError } from "@/lib/error-handler";
import { Conversation } from "@/lib/types/conversation.types";

export const useConversationDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const softDeleteConversation = async (id: string): Promise<Conversation | null> => {
    try {
      setIsDeleting(true);
      setError(null);
      const result = await conversationService.softDelete(id);
      return result;
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
      return null;
    } finally {
      setIsDeleting(false);
    }
  };

  const restoreConversation = async (id: string): Promise<Conversation | null> => {
    try {
      setIsDeleting(true);
      setError(null);
      const result = await conversationService.restore(id);
      return result;
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
      return null;
    } finally {
      setIsDeleting(false);
    }
  };

  const hardDeleteConversation = async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);
      await conversationService.delete(id);
      return true;
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    softDeleteConversation,
    restoreConversation,
    hardDeleteConversation,
    isDeleting,
    error,
  };
}; 