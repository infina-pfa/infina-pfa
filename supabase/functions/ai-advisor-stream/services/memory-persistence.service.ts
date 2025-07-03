import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Memory, QueueOperation } from '../types/memory.ts';
import { MEMORY_CONSTANTS } from '../config/memory.config.ts';

/**
 * Background queue for memory persistence
 * Handles async database operations to avoid blocking the main thread
 */
export class MemoryPersistenceService {
  private queue: QueueOperation[] = [];
  private processing = false;
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Add operation to background queue
   */
  async enqueue(operation: 'add' | 'update' | 'delete', data: Memory): Promise<void> {
    this.queue.push({ operation, data, timestamp: Date.now() });
    
    if (!this.processing) {
      this.processQueue();
    }
  }

  /**
   * Process queued operations in background
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) continue;
      
      try {
        await this.executeOperation(item);
      } catch (error) {
        console.error(`Memory persistence error (${item.operation}):`, error);
      }
      
      await new Promise(resolve => 
        setTimeout(resolve, MEMORY_CONSTANTS.QUEUE_PROCESSING_DELAY)
      );
    }
    
    this.processing = false;
  }

  /**
   * Execute database operation
   */
  private async executeOperation(item: QueueOperation): Promise<void> {
    switch (item.operation) {
      case 'add':
        await this.supabase.from('memory_history').insert(item.data);
        break;
      case 'update':
        await this.supabase
          .from('memory_history')
          .update(item.data)
          .eq('id', item.data.id);
        break;
      case 'delete':
        await this.supabase
          .from('memory_history')
          .delete()
          .eq('id', item.data.id);
        break;
    }
  }

  /**
   * Fetch all memories for a user
   */
  async fetchUserMemories(userId: string): Promise<{ content: string; created_at: string }[]> {
    const { data, error } = await this.supabase
      .from('memory_history')
      .select('content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user memories:', error);
      return [];
    }

    return data || [];
  }
} 