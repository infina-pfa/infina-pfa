import { AsyncMemoryManager } from '../memory-manager';
import { ConversationMessage } from '../types/memory';

/**
 * Process memory context for a user
 */
export async function processMemoryContext(
  memoryManager: AsyncMemoryManager,
  message: string,
  conversationHistory: ConversationMessage[],
  userId: string
): Promise<string> {
  try {
    console.log("🧠 Processing memory context for user:", userId);
    
    // Fetch existing user memories for context
    const memoryContext = await memoryManager.fetchAllUserMemories(userId);
    
    console.log("📚 Memory context length:", memoryContext.length);
    return memoryContext;
  } catch (error) {
    console.error("❌ Error processing memory context:", error);
    return '';
  }
}

/**
 * Process memory extraction in the background
 */
export async function processMemoryExtraction(
  memoryManager: AsyncMemoryManager,
  conversationHistory: ConversationMessage[],
  responseContent: string,
  userMessage: string,
  userId: string
): Promise<void> {
  try {
    console.log("🧠 Starting background memory extraction for user:", userId);
    
    // Process the last user message and AI response for memory extraction
    await memoryManager.processLastMessage(userMessage, responseContent, userId);
    
    console.log("✅ Memory extraction completed");
  } catch (error) {
    console.error("❌ Memory extraction error:", error);
  }
} 