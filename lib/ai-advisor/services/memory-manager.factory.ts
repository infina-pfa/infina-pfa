import { MemoryConfig } from '../types/memory';
import { MemoryConfigFactory } from '../config/memory.config';
import { MemoryPersistenceService } from './memory-persistence.service';
import { MemoryExtractionService } from './memory-extraction.service';
import { AsyncMemoryManager } from '../memory-manager';

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
    
    const extractionService = new MemoryExtractionService(config.openaiKey);
    
    return new AsyncMemoryManager(
      config,
      persistenceService,
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