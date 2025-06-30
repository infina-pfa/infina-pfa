import { useState, useCallback, useRef } from "react";
import { 
  ChatMessage, 
  StreamingMessageChunk, 
  ChatError,
  UseStreamingChatReturn 
} from "@/lib/types/chat.types";

export const useStreamingChat = (): UseStreamingChatReturn => {
  const [streamingMessage, setStreamingMessage] = useState<ChatMessage | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const startStream = useCallback(async (messageId: string, conversationId: string) => {
    // Clean up existing stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setIsStreaming(true);
    
    // Initialize streaming message
    const initialMessage: ChatMessage = {
      id: messageId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '', // Will be set by the API
      conversation_id: conversationId,
      content: '',
      sender: 'ai',
      type: 'text',
      metadata: null,
      isStreaming: true,
      streamingContent: ''
    };

    setStreamingMessage(initialMessage);

    // Create EventSource for streaming
    const streamUrl = `/api/chat/stream?conversationId=${conversationId}&messageId=${messageId}`;
    const eventSource = new EventSource(streamUrl);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const chunk: StreamingMessageChunk = JSON.parse(event.data);
        
        if (chunk.type === 'content' && chunk.content) {
          setStreamingMessage(prev => {
            if (!prev) return null;
            const newContent = (prev.streamingContent || '') + chunk.content;
            return {
              ...prev,
              streamingContent: newContent,
              content: newContent
            };
          });
                 } else if (chunk.type === 'component' && chunk.component) {
           setStreamingMessage(prev => {
             if (!prev) return null;
             return {
               ...prev,
               type: 'component',
               component: chunk.component,
               metadata: JSON.parse(JSON.stringify({ component: chunk.component }))
             };
           });
        } else if (chunk.type === 'complete') {
          setStreamingMessage(prev => {
            if (!prev) return null;
            return {
              ...prev,
              isStreaming: false
            };
          });
          setIsStreaming(false);
          eventSource.close();
        } else if (chunk.type === 'error') {
          onStreamError({
            code: 'STREAMING_ERROR',
            message: chunk.error || 'Streaming failed'
          });
        }
      } catch (error) {
        console.error('Error parsing stream chunk:', error);
        onStreamError({
          code: 'PARSE_ERROR',
          message: 'Failed to parse streaming response'
        });
      }
    };

    eventSource.onerror = () => {
      onStreamError({
        code: 'CONNECTION_ERROR',
        message: 'Connection to streaming service failed'
      });
    };

  }, []);

  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
    
    // Mark current streaming message as complete
    setStreamingMessage(prev => {
      if (!prev) return null;
      return {
        ...prev,
        isStreaming: false
      };
    });
  }, []);

  const onStreamChunk = useCallback((chunk: StreamingMessageChunk) => {
    // This is called when we manually receive chunks (for testing or custom implementations)
    if (chunk.type === 'content' && chunk.content) {
      setStreamingMessage(prev => {
        if (!prev) return null;
        const newContent = (prev.streamingContent || '') + chunk.content;
        return {
          ...prev,
          streamingContent: newContent,
          content: newContent
        };
      });
    }
  }, []);

  const onStreamComplete = useCallback(() => {
    setStreamingMessage(prev => {
      if (!prev) return null;
      return {
        ...prev,
        isStreaming: false
      };
    });
    setIsStreaming(false);
  }, []);

  const onStreamError = useCallback((error: ChatError) => {
    console.error('Streaming error:', error);
    setIsStreaming(false);
    
         // Update streaming message with error state
     setStreamingMessage(prev => {
       if (!prev) return null;
       const existingMetadata = prev.metadata ? JSON.parse(JSON.stringify(prev.metadata)) : {};
       return {
         ...prev,
         isStreaming: false,
         content: prev.content || 'Sorry, I encountered an error while responding.',
         metadata: JSON.parse(JSON.stringify({ ...existingMetadata, error }))
       };
     });

    // Clean up
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  return {
    streamingMessage,
    isStreaming,
    startStream,
    stopStream,
    onStreamChunk,
    onStreamComplete,
    onStreamError
  };
}; 