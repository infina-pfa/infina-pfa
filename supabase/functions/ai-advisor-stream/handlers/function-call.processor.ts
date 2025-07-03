import { FunctionCall, ResponseDataEvent } from "../types/index.ts";
import { UIActionService } from "../services/ui-action.service.ts";

interface StreamChunk {
  type: string;
  delta?: string;
  item_id?: string;
  item?: {
    id: string;
    type: string;
    name?: string;
    call_id?: string;
    arguments?: string;
  };
}

/**
 * Processor for handling function calls in OpenAI streams
 * Separates function call logic from stream handling
 */
export class FunctionCallProcessor {
  private functionCalls: { [key: string]: FunctionCall } = {};

  /**
   * Handle function call arguments deltas
   */
  handleFunctionCallArgumentsDeltas(
    chunk: StreamChunk,
    onEvent: (eventData: unknown) => void
  ): void {
    if (chunk.type === 'response.function_call_arguments.delta' && chunk.item_id && chunk.delta) {
      const itemId = chunk.item_id;
      
      if (!this.functionCalls[itemId]) {
        this.functionCalls[itemId] = {
          name: '',
          arguments: '',
          call_id: '',
          complete: false
        };
      }
      
      this.functionCalls[itemId].arguments += chunk.delta;

      onEvent({
        type: ResponseDataEvent.FUNCTION_CALL_ARGUMENTS_STREAMING,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Handle MCP call arguments
   */
  handleMCPCallArguments(
    chunk: StreamChunk,
    onEvent: (eventData: unknown) => void
  ): void {
    if (chunk.type === 'response.mcp_call.arguments.delta' && chunk.item_id && chunk.delta) {
      const itemId = chunk.item_id;
      
      if (!this.functionCalls[itemId]) {
        this.functionCalls[itemId] = {
          name: '',
          arguments: '',
          call_id: '',
          complete: false
        };
      }
      
      this.functionCalls[itemId].arguments += chunk.delta;
    }

    if (chunk.type === "response.mcp_call.in_progress") {
      onEvent({
        type: ResponseDataEvent.MCP_TOOL_CALLING,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Handle UI function call completion
   */
  handleUIFunctionCallCompletion(
    chunk: StreamChunk,
    onEvent: (eventData: unknown) => void,
    onError: (error: unknown) => void
  ): void {
    if (chunk.type === 'response.output_item.done' && chunk.item && chunk.item.type === 'function_call') {
      const item = chunk.item;
      const itemId = item.id;
      
      this.updateFunctionCall(itemId, item);
      this.processUIAction(item, onEvent, onError);
    }
  }

  /**
   * Handle MCP call completion
   */
  handleMCPCallCompletion(
    chunk: StreamChunk,
    onEvent: (eventData: unknown) => void
  ): void {
    if (chunk.type === 'response.output_item.done' && chunk.item && chunk.item.type === 'mcp_call') {
      onEvent({
        type: ResponseDataEvent.MCP_TOOL_CALL_DONE,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Update function call with completion data
   */
  private updateFunctionCall(
    itemId: string, 
    item: { id: string; type: string; name?: string; call_id?: string; arguments?: string }
  ): void {
    if (this.functionCalls[itemId]) {
      this.functionCalls[itemId].name = item.name || '';
      this.functionCalls[itemId].call_id = item.call_id || '';
      this.functionCalls[itemId].complete = true;
      this.functionCalls[itemId].arguments = item.arguments || this.functionCalls[itemId].arguments;
    } else {
      this.functionCalls[itemId] = {
        name: item.name || '',
        arguments: item.arguments || '',
        call_id: item.call_id || '',
        complete: true
      };
    }
  }

  /**
   * Process UI action from function call
   */
  private processUIAction(
    item: { id: string; type: string; name?: string; call_id?: string; arguments?: string },
    onEvent: (eventData: unknown) => void,
    onError: (error: unknown) => void
  ): void {
    try {
      console.log(`🔧 Function call arguments:`, item);
      
      if (!item.name) {
        console.warn('Function call missing name, skipping UI action processing');
        return;
      }
      
      const toolData = JSON.parse(item.arguments || '{}');
      const action = UIActionService.processOpenAIFunctionCall(item.name, toolData);

      onEvent({
        type: ResponseDataEvent.FUNCTION_CALL_ARGUMENTS_DONE,
        action,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error processing UI action:', error);
      onError(error);
    }
  }

  /**
   * Get all function calls
   */
  getFunctionCalls(): { [key: string]: FunctionCall } {
    return this.functionCalls;
  }
} 