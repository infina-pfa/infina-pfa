import { useState } from "react";
import { conversationService } from "@/lib/services/conversation.service";
import { handleError } from "@/lib/error-handler";
import { 
  Conversation, 
  CreateConversationRequest 
} from "@/lib/types/conversation.types";

export const useConversationCreate = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createConversation = async (
    data: CreateConversationRequest
  ): Promise<Conversation | null> => {
    try {
      setIsCreating(true);
      setError(null);
      const result = await conversationService.create(data);
      return result;
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createConversation,
    isCreating,
    error,
  };
}; 