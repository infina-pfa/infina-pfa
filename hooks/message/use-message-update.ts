import { useState } from "react";
import { messageService } from "@/lib/services/message.service";
import { handleError } from "@/lib/error-handler";
import { 
  Message, 
  UpdateMessageRequest 
} from "@/lib/types/message.types";

export const useMessageUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMessage = async (
    id: string,
    data: UpdateMessageRequest
  ): Promise<Message | null> => {
    try {
      setIsUpdating(true);
      setError(null);
      const result = await messageService.update(id, data);
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
    updateMessage,
    isUpdating,
    error,
  };
}; 