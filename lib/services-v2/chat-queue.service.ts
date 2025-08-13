interface QueuedMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'ai' | 'system';
  content: string;
  componentId?: string;
  metadata?: Record<string, unknown>;
  customTimestamp?: string;
  retryCount: number;
  timestamp: number;
}

interface QueueConfig {
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  flushInterval: number;
  maxQueueSize: number;
}

class ChatQueueService {
  private queue: QueuedMessage[] = [];
  private isProcessing = false;
  private config: QueueConfig;
  private flushTimer: NodeJS.Timeout | null = null;
  private onlineSyncTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      batchSize: 10,
      flushInterval: 2000, // 2 seconds
      maxQueueSize: 100,
      ...config
    };

    // Auto-flush queue periodically
    this.startAutoFlush();
    
    // Listen for online/offline events
    this.setupNetworkListener();
  }

  /**
   * Add message to queue for background processing
   * Returns immediately without waiting for save to complete
   */
  async enqueueMessage(
    conversationId: string,
    sender: 'user' | 'ai' | 'system',
    content: string,
    componentId?: string,
    metadata?: Record<string, unknown>,
    customTimestamp?: string
  ): Promise<void> {
    const message: QueuedMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
      conversationId,
      sender,
      content,
      componentId,
      metadata,
      customTimestamp,
      retryCount: 0,
      timestamp: Date.now()
    };

    // Check queue size limit
    if (this.queue.length >= this.config.maxQueueSize) {
      console.warn('⚠️ Chat queue is full, removing oldest messages');
      this.queue.splice(0, this.config.batchSize);
    }

    this.queue.push(message);
    
    console.log(`📤 Queued ${sender} message (queue size: ${this.queue.length})`);

    // Trigger immediate processing for critical messages
    if (this.shouldProcessImmediately(message)) {
      this.processQueue();
    }
  }

  /**
   * Process queue in background
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    try {
      // Process messages in batches
      const batch = this.queue.splice(0, this.config.batchSize);
      
      console.log(`🔄 Processing batch of ${batch.length} messages`);
      
      // Process messages in parallel for better performance
      const results = await Promise.allSettled(
        batch.map(message => this.processSingleMessage(message))
      );

      // Handle failed messages
      const failedMessages = results
        .map((result, index) => ({ result, message: batch[index] }))
        .filter(({ result }) => result.status === 'rejected')
        .map(({ message }) => message);

      if (failedMessages.length > 0) {
        console.warn(`❌ ${failedMessages.length} messages failed, requeueing...`);
        this.requeueFailedMessages(failedMessages);
      }

      console.log(`✅ Successfully processed ${batch.length - failedMessages.length} messages`);
      
    } catch (error) {
      console.error('❌ Batch processing failed:', error);
    } finally {
      this.isProcessing = false;
      
      // Continue processing if queue has more items
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 100);
      }
    }
  }

  /**
   * Process a single message
   */
  private async processSingleMessage(message: QueuedMessage): Promise<void> {
    try {
      // Dynamic import to avoid circular dependency
      const { onboardingService } = await import('./onboarding.service');
      
      await onboardingService.saveChatMessage(
        message.conversationId,
        message.sender,
        message.content,
        message.componentId,
        message.metadata,
        message.customTimestamp
      );
      
      console.log(`💾 Saved ${message.sender} message (ID: ${message.id})`);
    } catch (error) {
      console.error(`❌ Failed to save message ${message.id}:`, error);
      throw error;
    }
  }

  /**
   * Requeue failed messages with retry logic
   */
  private requeueFailedMessages(messages: QueuedMessage[]): void {
    for (const message of messages) {
      message.retryCount++;
      
      if (message.retryCount <= this.config.maxRetries) {
        // Add delay before retry
        setTimeout(() => {
          this.queue.unshift(message); // Add to front for priority
          console.log(`🔄 Retrying message ${message.id} (attempt ${message.retryCount})`);
        }, this.config.retryDelay * message.retryCount);
      } else {
        console.error(`💀 Message ${message.id} failed after ${this.config.maxRetries} retries`);
        // Could store in localStorage for later retry or send to error tracking
        this.handlePermanentFailure(message);
      }
    }
  }

  /**
   * Handle messages that failed permanently
   */
  private handlePermanentFailure(message: QueuedMessage): void {
    try {
      // Store in localStorage for later retry when app restarts
      const failedMessages = this.getFailedMessages();
      failedMessages.push(message);
      localStorage.setItem('failed_chat_messages', JSON.stringify(failedMessages));
      
      console.log(`📱 Stored failed message in localStorage for later retry`);
    } catch (error) {
      console.error('Failed to store message in localStorage:', error);
    }
  }

  /**
   * Get failed messages from localStorage
   */
  private getFailedMessages(): QueuedMessage[] {
    try {
      const stored = localStorage.getItem('failed_chat_messages');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Retry failed messages from localStorage
   */
  async retryFailedMessages(): Promise<void> {
    const failedMessages = this.getFailedMessages();
    
    if (failedMessages.length > 0) {
      console.log(`🔄 Retrying ${failedMessages.length} failed messages from localStorage`);
      
      // Reset retry count and add back to queue
      failedMessages.forEach(message => {
        message.retryCount = 0;
        this.queue.push(message);
      });
      
      // Clear localStorage
      localStorage.removeItem('failed_chat_messages');
      
      // Process immediately
      this.processQueue();
    }
  }

  /**
   * Determine if message should be processed immediately
   */
  private shouldProcessImmediately(message: QueuedMessage): boolean {
    // Process user messages immediately for better UX
    return message.sender === 'user' || 
           message.content.includes('error') || 
           (message.componentId?.includes('critical') ?? false);
  }

  /**
   * Start auto-flush timer
   */
  private startAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }, this.config.flushInterval);
  }

  /**
   * Setup network listener for online/offline sync
   */
  private setupNetworkListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('🌐 Back online - processing queued messages');
        this.retryFailedMessages();
        this.processQueue();
      });

      window.addEventListener('offline', () => {
        console.log('📴 Offline - messages will be queued');
      });
    }
  }

  /**
   * Force flush all queued messages
   */
  async flush(): Promise<void> {
    while (this.queue.length > 0) {
      await this.processQueue();
      // Small delay to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    queueSize: number;
    isProcessing: boolean;
    failedMessages: number;
  } {
    return {
      queueSize: this.queue.length,
      isProcessing: this.isProcessing,
      failedMessages: this.getFailedMessages().length
    };
  }

  /**
   * Clear queue (for testing)
   */
  clearQueue(): void {
    this.queue = [];
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    if (this.onlineSyncTimer) {
      clearInterval(this.onlineSyncTimer);
    }
  }

  /**
   * Cleanup on app exit
   */
  cleanup(): void {
    this.clearQueue();
  }
}

// Export singleton instance
export const chatQueueService = new ChatQueueService();

// Export for testing
export { ChatQueueService }; 