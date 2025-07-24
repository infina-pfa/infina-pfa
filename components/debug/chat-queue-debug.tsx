'use client';

import { useChatQueue } from '@/hooks/use-chat-queue';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

export const ChatQueueDebug = () => {
  const { status, error, refreshStatus, flushQueue, hasQueuedMessages, hasFailedMessages, isHealthy } = useChatQueue();

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 p-4 bg-white shadow-lg border-l-4 border-blue-500 max-w-sm z-50">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1">
          {isHealthy ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm font-medium">Chat Queue</span>
        </div>
        <Button
          onClick={refreshStatus}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Queue Size:</span>
          <span className={`font-mono ${hasQueuedMessages ? 'text-orange-600' : 'text-gray-500'}`}>
            {status.queueSize}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Processing:</span>
          <span className={`font-mono ${status.isProcessing ? 'text-blue-600' : 'text-gray-500'}`}>
            {status.isProcessing ? (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 animate-spin" />
                Yes
              </div>
            ) : (
              'No'
            )}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Failed:</span>
          <span className={`font-mono ${hasFailedMessages ? 'text-red-600' : 'text-gray-500'}`}>
            {status.failedMessages}
          </span>
        </div>

        {error && (
          <div className="mt-2 p-2 bg-red-50 text-red-700 rounded text-xs">
            {error}
          </div>
        )}
        
        {hasQueuedMessages && (
          <div className="mt-3 pt-2 border-t">
            <Button
              onClick={flushQueue}
              variant="outline"
              size="sm"
              className="w-full text-xs h-7"
            >
              Flush Queue
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}; 