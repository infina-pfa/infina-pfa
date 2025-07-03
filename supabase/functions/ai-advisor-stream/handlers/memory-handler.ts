import { AsyncMemoryManager } from "../memory-manager.ts";
import { ConversationMessage } from "../types/index.ts";

export async function processMemoryContext(
  memoryManager: AsyncMemoryManager,
  message: string,
  conversationHistory: ConversationMessage[],
  user_id: string
): Promise<string> {
  // Simple approach: fetch all user memories at once for system prompt
  if (!user_id) {
    console.log("ℹ️ No user_id provided, skipping memory fetch.");
    return "";
  }

  console.log("🧠 Fetching all user memories for startup context...");
  
  // Fetch all user memories (content only) for system prompt
  const memoryContext = await memoryManager.fetchAllUserMemories(user_id);
  
  if (memoryContext) {
    console.log("✅ User memories fetched successfully for system prompt");
  } else {
    console.log("ℹ️ No memories found or error occurred");
  }

  return memoryContext;
}

export async function processMemoryExtraction(
  memoryManager: AsyncMemoryManager,
  conversationHistory: ConversationMessage[],
  responseContent: string,
  message: string,
  user_id: string
): Promise<void> {
  // After streaming is complete, check only the last user message for memory extraction
  if (user_id && message) {
    console.log("💾 Processing last user message to check if memory extraction is needed...");
    console.log("💾 Last user message:", message);
    
    // Extract memories from just the last message exchange (non-blocking)
    memoryManager.processLastMessage(message, responseContent, user_id)
      .then(() => console.log("✅ Memory processing task started in background."))
      .catch(err => console.error('❌ Memory extraction submission error:', err));
  } else {
    console.log("ℹ️ Skipping memory processing due to missing data (userId or message).");
  }
} 