import { useState } from "react";
import { messageService } from "@/lib/services/message.service";
import { handleError } from "@/lib/error-handler";

export const useMessageDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteMessage = async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);
      await messageService.delete(id);
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
    deleteMessage,
    isDeleting,
    error,
  };
}; 