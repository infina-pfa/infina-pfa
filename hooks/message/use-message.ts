import { useState, useEffect, useCallback } from "react";
import { messageService } from "@/lib/services/message.service";
import { handleError } from "@/lib/error-handler";
import { Message } from "@/lib/types/message.types";

export const useMessage = (id: string | null) => {
  const [message, setMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessage = useCallback(async () => {
    if (!id) {
      setMessage(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await messageService.getById(id);
      setMessage(data);
    } catch (error) {
      const appError = handleError(error);
      setError(appError.message);
      setMessage(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMessage();
  }, [loadMessage]);

  return {
    message,
    isLoading,
    error,
    refetch: loadMessage,
  };
}; 