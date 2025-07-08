import { useState, useEffect } from 'react';
import { onboardingService } from '@/lib/services/onboarding.service';

interface ChatQueueStatus {
  queueSize: number;
  isProcessing: boolean;
  failedMessages: number;
}

export const useChatQueue = () => {
  const [status, setStatus] = useState<ChatQueueStatus>({
    queueSize: 0,
    isProcessing: false,
    failedMessages: 0
  });
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = async () => {
    try {
      const newStatus = await onboardingService.getChatQueueStatus();
      setStatus(newStatus);
      setError(null);
    } catch (err) {
      console.error('Failed to get chat queue status:', err);
      setError(err instanceof Error ? err.message : 'Failed to get queue status');
    }
  };

  const flushQueue = async () => {
    try {
      await onboardingService.flushChatQueue();
      await refreshStatus(); // Refresh status after flush
    } catch (err) {
      console.error('Failed to flush chat queue:', err);
      setError(err instanceof Error ? err.message : 'Failed to flush queue');
    }
  };

  // Auto-refresh status every 5 seconds
  useEffect(() => {
    const interval = setInterval(refreshStatus, 5000);
    
    // Initial load
    refreshStatus();
    
    return () => clearInterval(interval);
  }, []);

  return {
    status,
    error,
    refreshStatus,
    flushQueue,
    
    // Helper flags
    hasQueuedMessages: status.queueSize > 0,
    hasFailedMessages: status.failedMessages > 0,
    isHealthy: status.failedMessages === 0 && !error
  };
}; 