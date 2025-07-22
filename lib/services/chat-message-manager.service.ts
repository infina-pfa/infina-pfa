import { onboardingService } from "./onboarding.service";

/**
 * Chat Message Manager Service
 *
 * This service manages the saving of chat messages in proper order,
 * preventing race conditions and ensuring message consistency.
 *
 * It uses a combination of synchronous saves for critical messages
 * and queued saves for better UX, while maintaining proper ordering.
 */
class ChatMessageManagerService {
  private messageOrder = 0;
  private pendingSaves = new Map<string, Promise<unknown>>();

  /**
   * Save a chat message with proper ordering guarantees
   *
   * @param critical - If true, saves synchronously to ensure immediate persistence
   */
  async saveChatMessage(
    conversationId: string,
    sender: "user" | "ai" | "system",
    content: string,
    componentId?: string,
    metadata?: Record<string, unknown>,
    customTimestamp?: string,
    critical: boolean = false
  ): Promise<void> {
    const messageId = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}`;
    const order = this.messageOrder++;

    // Log the message details
    console.log(
      `💾 Saving ${sender} message (order: ${order}, critical: ${critical})`
    );

    // For critical messages (like initial setup), use synchronous save
    if (critical) {
      await this.saveSynchronously(
        messageId,
        conversationId,
        sender,
        content,
        componentId,
        metadata,
        customTimestamp,
        order
      );
    } else {
      // For non-critical messages, use async save for better UX
      this.saveAsynchronously(
        messageId,
        conversationId,
        sender,
        content,
        componentId,
        metadata,
        customTimestamp,
        order
      );
    }
  }

  /**
   * Save message synchronously with ordering
   */
  private async saveSynchronously(
    messageId: string,
    conversationId: string,
    sender: "user" | "ai" | "system",
    content: string,
    componentId?: string,
    metadata?: Record<string, unknown>,
    customTimestamp?: string,
    order: number
  ): Promise<void> {
    try {
      // Wait for any previous saves to complete to maintain order
      const previousSaves = Array.from(this.pendingSaves.values());
      if (previousSaves.length > 0) {
        await Promise.all(previousSaves);
      }

      // Add order to metadata for proper sequencing
      const enhancedMetadata = {
        ...metadata,
        messageOrder: order,
      };

      // Save synchronously
      const savePromise = onboardingService.saveChatMessage(
        conversationId,
        sender,
        content,
        componentId,
        enhancedMetadata,
        customTimestamp
      );

      this.pendingSaves.set(messageId, savePromise);

      await savePromise;

      this.pendingSaves.delete(messageId);

      console.log(`✅ Synchronously saved ${sender} message (order: ${order})`);
    } catch (error) {
      console.error(
        `❌ Failed to save ${sender} message synchronously:`,
        error
      );
      throw error;
    }
  }

  /**
   * Save message asynchronously with ordering
   */
  private async saveAsynchronously(
    messageId: string,
    conversationId: string,
    sender: "user" | "ai" | "system",
    content: string,
    componentId?: string,
    metadata?: Record<string, unknown>,
    customTimestamp?: string,
    order: number
  ): Promise<void> {
    try {
      // Add order to metadata for proper sequencing
      const enhancedMetadata = {
        ...metadata,
        messageOrder: order,
      };

      // Use async save but track the promise
      const savePromise = onboardingService.saveChatMessageAsync(
        conversationId,
        sender,
        content,
        componentId,
        enhancedMetadata,
        customTimestamp
      );

      this.pendingSaves.set(messageId, savePromise);

      // Clean up after save completes
      savePromise
        .then(() => {
          this.pendingSaves.delete(messageId);
          console.log(
            `✅ Asynchronously saved ${sender} message (order: ${order})`
          );
        })
        .catch((error) => {
          this.pendingSaves.delete(messageId);
          console.error(
            `❌ Failed to save ${sender} message asynchronously:`,
            error
          );
        });
    } catch (error) {
      console.error(`❌ Failed to queue ${sender} message:`, error);
    }
  }

  /**
   * Wait for all pending saves to complete
   * Useful before critical operations or navigation
   */
  async waitForPendingSaves(): Promise<void> {
    const pendingSaves = Array.from(this.pendingSaves.values());
    if (pendingSaves.length > 0) {
      console.log(
        `⏳ Waiting for ${pendingSaves.length} pending saves to complete...`
      );
      await Promise.all(pendingSaves);
      console.log("✅ All pending saves completed");
    }
  }

  /**
   * Get the number of pending saves
   */
  getPendingSaveCount(): number {
    return this.pendingSaves.size;
  }

  /**
   * Reset the message order counter (use carefully)
   */
  resetMessageOrder(): void {
    this.messageOrder = 0;
    console.log("🔄 Message order counter reset");
  }
}

export const chatMessageManager = new ChatMessageManagerService();
