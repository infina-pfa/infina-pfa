import { z } from "zod";
import { CONVERSATION_VALIDATION } from "@/lib/types/conversation.types";

export const conversationSchema = {
  create: z.object({
    title: z
      .string()
      .min(CONVERSATION_VALIDATION.title.minLength, "Title is required")
      .max(CONVERSATION_VALIDATION.title.maxLength, "Title is too long")
      .trim(),
    latest_response_id: z.string().nullable().optional(),
  }),

  update: z.object({
    title: z
      .string()
      .min(CONVERSATION_VALIDATION.title.minLength, "Title cannot be empty")
      .max(CONVERSATION_VALIDATION.title.maxLength, "Title is too long")
      .trim()
      .optional(),
    latest_response_id: z.string().nullable().optional(),
    deleted_at: z.string().nullable().optional(),
  }),
}; 