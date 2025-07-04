import { promises as fs } from 'fs';
import path from 'path';

interface SystemPromptLogData {
  userId: string;
  requestId: string;
  timestamp: string;
  currentStep: string;
  userProfile?: Record<string, unknown>;
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  systemPrompt: string;
  promptLength: number;
  userMessage: string;
}

export class SystemPromptLogger {
  private static logDir = path.join(process.cwd(), 'logs', 'system-prompts');

  /**
   * Ensures the log directory exists
   */
  private static async ensureLogDirectory(): Promise<void> {
    try {
      await fs.access(this.logDir);
    } catch {
      await fs.mkdir(this.logDir, { recursive: true });
    }
  }

  /**
   * Generates a unique request ID
   */
  private static generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Logs system prompt to file for debugging
   */
  public static async logSystemPrompt({
    userId,
    currentStep,
    userProfile,
    conversationHistory,
    systemPrompt,
    userMessage,
  }: {
    userId: string;
    currentStep: string;
    userProfile?: Record<string, unknown>;
    conversationHistory?: Array<{
      role: "user" | "assistant";
      content: string;
    }>;
    systemPrompt: string;
    userMessage: string;
  }): Promise<string> {
    try {
      await this.ensureLogDirectory();

      const requestId = this.generateRequestId();
      const timestamp = new Date().toISOString();
      
      const logData: SystemPromptLogData = {
        userId,
        requestId,
        timestamp,
        currentStep,
        userProfile,
        conversationHistory,
        systemPrompt,
        promptLength: systemPrompt.length,
        userMessage,
      };

      // Create filename with timestamp and user ID
      const filename = `${timestamp.split('T')[0]}_${userId.slice(0, 8)}_${requestId}.json`;
      const filepath = path.join(this.logDir, filename);

      // Write log data to file
      await fs.writeFile(filepath, JSON.stringify(logData, null, 2), 'utf-8');

      console.log(`📝 System prompt logged to: ${filepath}`);
      console.log(`📊 Prompt stats: ${systemPrompt.length} characters, Step: ${currentStep}`);

      return requestId;
    } catch (error) {
      console.error('❌ Failed to log system prompt:', error);
      // Don't throw error to avoid breaking the main flow
      return `fallback-${Date.now()}`;
    }
  }

  /**
   * Creates a summary log entry (lighter weight logging)
   */
  public static async logPromptSummary({
    userId,
    currentStep,
    promptLength,
    userMessage,
    requestId,
  }: {
    userId: string;
    currentStep: string;
    promptLength: number;
    userMessage: string;
    requestId?: string;
  }): Promise<void> {
    try {
      await this.ensureLogDirectory();

      const timestamp = new Date().toISOString();
      const summaryFile = path.join(this.logDir, 'daily-summary.jsonl');
      
      const summaryEntry = {
        timestamp,
        userId: userId.slice(0, 8), // Shortened for privacy
        requestId: requestId || this.generateRequestId(),
        currentStep,
        promptLength,
        userMessagePreview: userMessage.substring(0, 100),
      };

      // Append to daily summary file (JSONL format)
      await fs.appendFile(summaryFile, JSON.stringify(summaryEntry) + '\n', 'utf-8');

    } catch (error) {
      console.error('❌ Failed to log prompt summary:', error);
    }
  }

  /**
   * Cleans up old log files (optional utility)
   */
  public static async cleanupOldLogs(daysToKeep: number = 7): Promise<void> {
    try {
      const files = await fs.readdir(this.logDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.logDir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime < cutoffDate) {
            await fs.unlink(filePath);
            console.log(`🗑️ Cleaned up old log file: ${file}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to cleanup old logs:', error);
    }
  }
} 