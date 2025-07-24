import { STREAM_EVENTS } from "../constants/index";

/**
 * Abstract base class for stream handlers
 * Provides common functionality for OpenAI and Gemini stream handling
 */
export abstract class BaseStreamHandler {
  protected controller: ReadableStreamDefaultController;
  protected encoder: TextEncoder;
  protected responseContent: string;
  protected streamEnded: boolean;

  constructor(controller: ReadableStreamDefaultController) {
    this.controller = controller;
    this.encoder = new TextEncoder();
    this.responseContent = '';
    this.streamEnded = false;
  }

  /**
   * Send event to stream
   */
  protected sendEvent(eventData: unknown): void {
    if (this.streamEnded) {
      console.log("⚠️ Attempted to send event after stream ended:", eventData);
      return;
    }
    
    const message = `${STREAM_EVENTS.DATA}${JSON.stringify(eventData)}${STREAM_EVENTS.SEPARATOR}`;
    this.controller.enqueue(this.encoder.encode(message));
  }

  /**
   * End the stream
   */
  public endStream(): void {
    if (this.streamEnded) {
      console.log("⚠️ Attempted to end stream that's already ended");
      return;
    }
    
    this.controller.enqueue(this.encoder.encode(STREAM_EVENTS.DONE));
    this.controller.close();
    this.streamEnded = true;
  }

  /**
   * Send error and end stream
   */
  public sendError(error: unknown): void {
    const errorData = {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown streaming error',
      timestamp: new Date().toISOString(),
      context: 'streaming_response'
    };
    this.sendEvent(errorData);
    this.endStream();
  }

  /**
   * Get accumulated response content
   */
  public getResponseContent(): string {
    return this.responseContent;
  }

  /**
   * Check if stream has ended
   */
  public isStreamEnded(): boolean {
    return this.streamEnded;
  }

  /**
   * Add content to response
   */
  protected addToResponse(content: string): void {
    this.responseContent += content;
  }

  /**
   * Send content event with timestamp
   */
  protected sendContentEvent(type: string, content: string, additional?: Record<string, unknown>): void {
    const data = {
      type,
      content,
      timestamp: new Date().toISOString(),
      ...additional
    };
    this.sendEvent(data);
  }
} 