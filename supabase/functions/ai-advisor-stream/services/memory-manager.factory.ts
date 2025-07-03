import { MemoryConfig } from '../types/memory.ts';
import { MemoryConfigFactory } from '../config/memory.config.ts';
import { MemoryPersistenceService } from './memory-persistence.service.ts';
import { EmbeddingService } from './embedding.service.ts';
import { MemoryExtractionService } from './memory-extraction.service.ts';
import { AsyncMemoryManager } from '../memory-manager.ts';

/**
 * Factory for creating AsyncMemoryManager instances
 * Handles dependency injection and configuration
 */
export class MemoryManagerFactory {
  /**
   * Create a configured AsyncMemoryManager instance
   */
  static create(configOverrides: Partial<MemoryConfig> = {}): AsyncMemoryManager {
    const config = MemoryConfigFactory.create(configOverrides);
    
    const persistenceService = new MemoryPersistenceService(
      config.supabaseUrl,
      config.supabaseKey
    );
    
    const embeddingService = new EmbeddingService(config.openaiKey);
    const extractionService = new MemoryExtractionService(config.openaiKey);
    
    return new AsyncMemoryManager(
      config,
      persistenceService,
      embeddingService,
      extractionService
    );
  }

  /**
   * Create memory manager from environment variables
   */
  static createFromEnv(): AsyncMemoryManager {
    return this.create();
  }
} 