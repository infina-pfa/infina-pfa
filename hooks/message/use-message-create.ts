import { useState } from "react";
import { messageService } from "@/lib/services/message.service";
import { handleError } from "@/lib/error-handler";
import { 
  Message, 
  CreateMessageRequest 
} from "@/lib/types/message.types";

export const useMessageCreate = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMessage = async (
    data: CreateMessageRequest
  ): Promise<Message | null> => {
    try {
      setIsCreating(true);
      setError(null);
      const result = await messageService.create(data);
      return result;
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const addUserMessage = async (
    conversationId: string,
    content: string,
    metaData?: Record<string, unknown>
  ): Promise<Message | null> => {
    try {
      setIsCreating(true);
      setError(null);
      const result = await messageService.addUserMessage(conversationId, content, metaData);
      return result;
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const addBotMessage = async (
    conversationId: string,
    content: string,
    metaData?: Record<string, unknown>
  ): Promise<Message | null> => {
    try {
      setIsCreating(true);
      setError(null);
      const result = await messageService.addBotMessage(conversationId, content, metaData);
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
    createMessage,
    addUserMessage,
    addBotMessage,
    isCreating,
    error,
  };
}; 