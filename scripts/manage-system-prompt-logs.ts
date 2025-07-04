#!/usr/bin/env tsx

import { SystemPromptLogger } from '../lib/utils/system-prompt-logger';
import { promises as fs } from 'fs';
import path from 'path';

interface LogEntry {
  userId: string;
  requestId: string;
  timestamp: string;
  currentStep: string;
  promptLength: number;
  userMessage: string;
}

class LogManager {
  private static logDir = path.join(process.cwd(), 'logs', 'system-prompts');

  /**
   * Lists all log files
   */
  static async listLogs(): Promise<void> {
    try {
      const files = await fs.readdir(this.logDir);
      const logFiles = files.filter(f => f.endsWith('.json')).sort();
      
      console.log(`📁 Found ${logFiles.length} log files:`);
      for (const file of logFiles) {
        const stats = await fs.stat(path.join(this.logDir, file));
        console.log(`  ${file} (${(stats.size / 1024).toFixed(1)}KB) - ${stats.mtime.toLocaleString()}`);
      }
    } catch (error) {
      console.error('❌ Failed to list logs:', error);
    }
  }

  /**
   * Shows recent log summaries
   */
  static async showRecentLogs(count: number = 10): Promise<void> {
    try {
      const summaryFile = path.join(this.logDir, 'daily-summary.jsonl');
      const content = await fs.readFile(summaryFile, 'utf-8');
      const lines = content.trim().split('\n').slice(-count);
      
      console.log(`📊 Last ${lines.length} requests:`);
      console.log('Timestamp'.padEnd(20) + 'User'.padEnd(10) + 'Step'.padEnd(15) + 'Length'.padEnd(8) + 'Message Preview');
      console.log('-'.repeat(80));
      
      for (const line of lines) {
        const entry: LogEntry = JSON.parse(line);
        const time = new Date(entry.timestamp).toLocaleTimeString();
        const user = entry.userId.substring(0, 8);
        const step = entry.currentStep;
        const length = entry.promptLength.toString();
        const preview = entry.userMessage.substring(0, 30) + '...';
        
        console.log(time.padEnd(20) + user.padEnd(10) + step.padEnd(15) + length.padEnd(8) + preview);
      }
    } catch (error) {
      console.error('❌ Failed to show recent logs:', error);
    }
  }

  /**
   * Shows details of a specific log file
   */
  static async showLogDetails(filename: string): Promise<void> {
    try {
      const filepath = path.join(this.logDir, filename);
      const content = await fs.readFile(filepath, 'utf-8');
      const logData = JSON.parse(content);
      
      console.log('📝 Log Details:');
      console.log(`  Request ID: ${logData.requestId}`);
      console.log(`  User ID: ${logData.userId}`);
      console.log(`  Timestamp: ${logData.timestamp}`);
      console.log(`  Current Step: ${logData.currentStep}`);
      console.log(`  Prompt Length: ${logData.promptLength} characters`);
      console.log(`  User Message: ${logData.userMessage}`);
      console.log(`  Conversation History: ${logData.conversationHistory?.length || 0} messages`);
      console.log('\n🤖 System Prompt Preview (first 500 chars):');
      console.log(logData.systemPrompt.substring(0, 500) + '...');
      
      if (logData.userProfile && Object.keys(logData.userProfile).length > 0) {
        console.log('\n👤 User Profile:');
        console.log(JSON.stringify(logData.userProfile, null, 2));
      }
    } catch (error) {
      console.error('❌ Failed to show log details:', error);
    }
  }

  /**
   * Analyzes prompt usage patterns
   */
  static async analyzeUsage(): Promise<void> {
    try {
      const summaryFile = path.join(this.logDir, 'daily-summary.jsonl');
      const content = await fs.readFile(summaryFile, 'utf-8');
      const lines = content.trim().split('\n');
      
      const stepCounts: Record<string, number> = {};
      const lengthStats: number[] = [];
      const totalRequests = lines.length;
      
      for (const line of lines) {
        const entry: LogEntry = JSON.parse(line);
        stepCounts[entry.currentStep] = (stepCounts[entry.currentStep] || 0) + 1;
        lengthStats.push(entry.promptLength);
      }
      
      const avgLength = Math.round(lengthStats.reduce((a, b) => a + b, 0) / lengthStats.length);
      const maxLength = Math.max(...lengthStats);
      const minLength = Math.min(...lengthStats);
      
      console.log('📊 Usage Analysis:');
      console.log(`  Total Requests: ${totalRequests}`);
      console.log(`  Average Prompt Length: ${avgLength} characters`);
      console.log(`  Max Prompt Length: ${maxLength} characters`);
      console.log(`  Min Prompt Length: ${minLength} characters`);
      console.log('\n📈 Steps Distribution:');
      
      for (const [step, count] of Object.entries(stepCounts).sort((a, b) => b[1] - a[1])) {
        const percentage = ((count / totalRequests) * 100).toFixed(1);
        console.log(`  ${step.padEnd(20)}: ${count.toString().padStart(3)} (${percentage}%)`);
      }
    } catch (error) {
      console.error('❌ Failed to analyze usage:', error);
    }
  }

  /**
   * Cleanup old logs
   */
  static async cleanup(days: number = 7): Promise<void> {
    console.log(`🗑️ Cleaning up logs older than ${days} days...`);
    await SystemPromptLogger.cleanupOldLogs(days);
    console.log('✅ Cleanup completed');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'list':
      await LogManager.listLogs();
      break;
      
    case 'recent':
      const count = parseInt(args[1]) || 10;
      await LogManager.showRecentLogs(count);
      break;
      
    case 'show':
      if (!args[1]) {
        console.error('❌ Please provide a filename: npm run logs show <filename>');
        process.exit(1);
      }
      await LogManager.showLogDetails(args[1]);
      break;
      
    case 'analyze':
      await LogManager.analyzeUsage();
      break;
      
    case 'cleanup':
      const days = parseInt(args[1]) || 7;
      await LogManager.cleanup(days);
      break;
      
    default:
      console.log('📝 System Prompt Log Manager');
      console.log('');
      console.log('Available commands:');
      console.log('  npm run logs list              - List all log files');
      console.log('  npm run logs recent [count]    - Show recent log summaries (default: 10)');
      console.log('  npm run logs show <filename>   - Show details of a specific log file');
      console.log('  npm run logs analyze           - Analyze usage patterns');
      console.log('  npm run logs cleanup [days]    - Clean up logs older than N days (default: 7)');
      console.log('');
      console.log('Examples:');
      console.log('  npm run logs recent 5');
      console.log('  npm run logs show 2025-01-03_3c55a622_req-1735887373423-k8j3h2n1.json');
      console.log('  npm run logs cleanup 14');
  }
}

if (require.main === module) {
  main().catch(console.error);
} 