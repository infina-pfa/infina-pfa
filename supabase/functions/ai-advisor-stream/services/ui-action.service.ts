/**
 * Service for processing UI actions from both OpenAI and Gemini function calls
 * Centralizes UI action creation and validation logic
 */
export class UIActionService {
  
  /**
   * Process OpenAI function call into UI action
   */
  static processOpenAIFunctionCall(functionName: string, toolData: Record<string, unknown>) {
    return {
      type: functionName,
      payload: {
        componentId: toolData.component_id,
        toolId: toolData.tool_id,
        title: toolData.title,
        context: toolData.context || {},
      },
    };
  }

  /**
   * Process Gemini function call into UI action
   */
  static processGeminiFunctionCall(functionName: string, args: Record<string, unknown>) {
    if (!this.isValidUIFunction(functionName)) {
      throw new Error(`Unknown function: ${functionName}. Only UI tools are supported.`);
    }

    switch (functionName) {
      case 'open_tool':
        return {
          type: 'OPEN_TOOL',
          payload: {
            toolId: args.tool_id,
            title: args.title,
            context: args.context || {}
          },
          metadata: {
            timestamp: new Date().toISOString(),
            triggerReason: args.trigger_reason || 'AI suggested this tool',
            userIntent: `Sử dụng ${args.title}`,
            provider: 'gemini'
          }
        };
        
      case 'show_component':
        return {
          type: 'SHOW_COMPONENT',
          payload: {
            componentId: args.component_id,
            title: args.title,
            context: args.context || {}
          },
          metadata: {
            timestamp: new Date().toISOString(),
            triggerReason: 'ai_suggested_component',
            userIntent: `Hiển thị ${args.title}`,
            provider: 'gemini'
          }
        };
        
      case 'show_suggestion':
        return {
          type: 'SHOW_SUGGESTION',
          payload: {
            type: args.suggestion_type,
            title: args.title,
            content: args.content
          },
          metadata: {
            timestamp: new Date().toISOString(),
            triggerReason: 'ai_suggestion',
            userIntent: 'Hiển thị gợi ý',
            provider: 'gemini'
          }
        };
        
      default:
        throw new Error(`Unsupported UI function: ${functionName}`);
    }
  }

  /**
   * Check if function name is a valid UI function
   */
  private static isValidUIFunction(functionName: string): boolean {
    const validFunctions = ['open_tool', 'show_component', 'show_suggestion'];
    return validFunctions.includes(functionName);
  }

  /**
   * Create UI action event data
   */
  static createUIActionEvent(
    action: unknown, 
    messageSegment?: number, 
    provider: string = 'unknown'
  ) {
    return {
      type: 'ui_action',
      action,
      timestamp: new Date().toISOString(),
      messageSegment,
      provider
    };
  }

  /**
   * Create error event for UI action processing
   */
  static createUIActionError(
    functionName: string, 
    error: string, 
    messageSegment?: number
  ) {
    return {
      type: 'error',
      error: `Failed to process UI function: ${functionName} - ${error}`,
      timestamp: new Date().toISOString(),
      messageSegment,
      context: 'ui_action_processing'
    };
  }
} 