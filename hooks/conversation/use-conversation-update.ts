import { useState } from "react";
import { conversationService } from "@/lib/services/conversation.service";
import { handleError } from "@/lib/error-handler";
import { 
  Conversation, 
  UpdateConversationRequest 
} from "@/lib/types/conversation.types";

export const useConversationUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateConversation = async (
    id: string,
    data: UpdateConversationRequest
  ): Promise<Conversation | null> => {
    try {
      setIsUpdating(true);
      setError(null);
      const result = await conversationService.update(id, data);
      return result;
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateConversation,
    isUpdating,
    error,
  };
}; 