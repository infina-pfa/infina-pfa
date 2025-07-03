import { Memory, MemoryConfig, ConversationMessage } from './types/memory.ts';
import { MemoryPersistenceService } from './services/memory-persistence.service.ts';
import { EmbeddingService } from './services/embedding.service.ts';
import { MemoryExtractionService } from './services/memory-extraction.service.ts';

/**
 * AsyncMemoryManager - Orchestrates memory operations using injected services
 * 
 * Key Features:
 * - Non-blocking search and retrieval
 * - Background persistence
 * - Intelligent memory extraction
 */
export class AsyncMemoryManager {
  private config: MemoryConfig;
  private persistenceService: MemoryPersistenceService;
  private embeddingService: EmbeddingService;
  private extractionService: MemoryExtractionService;

  constructor(
    config: MemoryConfig,
    persistenceService: MemoryPersistenceService,
    embeddingService: EmbeddingService,
    extractionService: MemoryExtractionService
  ) {
    this.config = config;
    this.persistenceService = persistenceService;
    this.embeddingService = embeddingService;
    this.extractionService = extractionService;
  }

  /**
   * Add memory with background persistence
   */
  async addMemory(
    content: string,
    userId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    console.log(`🧠 Generating embedding for new memory: "${content.substring(0, 50)}..."`);
    const embedding = await this.embeddingService.generateEmbedding(content);

    const memory: Memory = {
      id: crypto.randomUUID(),
      user_id: userId,
      content,
      embedding,
      metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.config.backgroundPersist) {
      console.log(`💾 Queuing new memory for user ${userId}.`);
      await this.persistenceService.enqueue('add', memory);
    } else {
      console.log(`💾 Inserting new memory directly for user ${userId}.`);
      await this.persistenceService.enqueue('add', memory);
    }
  }

  /**
   * Process conversation and extract memories intelligently
   */
  async processConversation(
    messages: ConversationMessage[],
    userId: string
  ): Promise<void> {
    try {
      const facts = await this.extractionService.extractFromConversation(messages);
      
      for (const fact of facts) {
        if (typeof fact === 'string') {
          console.log(`✅ Extracted fact to remember: "${fact}"`);
          await this.addMemory(fact, userId, {
            source: 'conversation_extraction',
            conversation_id: messages[0]?.role,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Memory processing error:', error);
    }
  }

  /**
   * Process only the last user message to extract memories
   */
  async processLastMessage(
    userMessage: string,
    aiResponse: string,
    userId: string
  ): Promise<void> {
    if (!this.extractionService.shouldSaveMemory(userMessage)) {
      console.log('ℹ️ Last user message does not require memory extraction');
      return;
    }

    try {
      const extractionResult = await this.extractionService.extractFromMessage(userMessage);
      
      if (!extractionResult.should_save) {
        console.log('No need to save memory, skipping memory extraction.');
        return;
      }

      for (const fact of extractionResult.facts) {
        if (typeof fact === 'object' && 'fact' in fact && 'category' in fact) {
          console.log(`✅ Extracted fact from last message: "${fact.fact}"`);
          await this.addMemory(fact.fact, userId, {
            category: fact.category,
            captured_at: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Last message memory extraction error:', error);
    }
  }

  /**
   * Fetch all user memories for startup context
   */
  async fetchAllUserMemories(userId: string): Promise<string> {
    try {
      const memories = await this.persistenceService.fetchUserMemories(userId);

      if (memories.length === 0) {
        console.log(`📝 No memories found for user: ${userId}`);
        return '';
      }

      console.log(`📚 Fetched ${memories.length} memories for user: ${userId}`);
      
      const memoryContext = `=== User Personal Information & Context (Sorted by created_at from latest to oldest) ===
${memories.map((item, index) => `${index + 1}. ${item.content} (Created at: ${item.created_at})`).join('\n')}
=== End of User Personal Information ===`;

      console.log("💾 Memory context:", memoryContext);
      return memoryContext;
    } catch (error) {
      console.error('Unexpected error fetching user memories:', error);
      return '';
    }
  }
} 