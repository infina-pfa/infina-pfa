import OpenAI from "npm:openai";
import { MEMORY_CONSTANTS } from '../config/memory.config.ts';

/**
 * Service for generating text embeddings using OpenAI
 */
export class EmbeddingService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Generate embedding for given text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: MEMORY_CONSTANTS.EMBEDDING_MODEL,
        input: text,
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      throw error;
    }
  }
} 