import { LLMConfig } from "../config/index.ts";
import { GeminiTool, GeminiFunctionDeclaration, GeminiStreamChunk, FunctionTool } from "../types/index.ts";

export class GeminiClient {
  private apiKey: string;
  private model: string;
  private temperature: number;
  private thinkingBudget: number;

  constructor(config: LLMConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.temperature = config.temperature;
    this.thinkingBudget = config.thinkingBudget || 0;
  }

  // Convert function tools to Gemini format (UI tools only)
  private convertFunctionToolsToGemini(tools: unknown[]): GeminiTool[] {
    const functionDeclarations: GeminiFunctionDeclaration[] = [];

    for (const tool of tools) {
      if (this.isFunctionTool(tool)) {
        // Handle only UI function tools
        functionDeclarations.push({
          name: tool.name,
          description: tool.description,
          parameters: {
            type: "object",
            properties: tool.parameters.properties,
            required: tool.parameters.required
          }
        });
      }
    }

    console.log(`🛠️ Total function declarations for Gemini: ${functionDeclarations.length}`);
    return functionDeclarations.length > 0 ? [{ function_declarations: functionDeclarations }] : [];
  }

  private isFunctionTool(tool: unknown): tool is FunctionTool {
    return typeof tool === 'object' && tool !== null && 
           'type' in tool && (tool as Record<string, unknown>).type === 'function';
  }

  // Create streaming response using Gemini API
  async generateContentStream(messages: Array<{ role: string; content: string }>, tools: unknown[]) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:streamGenerateContent?alt=sse&key=${this.apiKey}`;
    
    // Convert messages to Gemini format
    const contents = messages
      .filter(msg => msg.role !== 'system') // Gemini handles system messages differently
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

    // Get system message content for system instruction
    const systemMessage = messages.find(msg => msg.role === 'system');
    
    // Convert function tools to Gemini format (UI tools only)
    const geminiTools = this.convertFunctionToolsToGemini(tools);

    const requestBody = {
      contents,
      systemInstruction: systemMessage ? {
        parts: [{ text: systemMessage.content }]
      } : undefined,
      tools: geminiTools.length > 0 ? geminiTools : undefined,
      generationConfig: {
        temperature: this.temperature,
        candidateCount: 1,
        maxOutputTokens: 8192,
        thinkingConfig: {
          thinkingBudget: this.thinkingBudget // 0 disables thinking mode
        }
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    console.log("📝 Gemini Request:", {
      model: this.model,
      temperature: this.temperature,
      thinkingBudget: this.thinkingBudget,
      toolsCount: geminiTools.length,
      contentsCount: contents.length,
      hasSystemInstruction: !!systemMessage
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Gemini API Error (${response.status}):`, errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    return this.createStreamIterator(response);
  }

  // Create stream iterator from response
  private async* createStreamIterator(response: Response): AsyncGenerator<GeminiStreamChunk> {
    if (!response.body) {
      throw new Error('No response body available');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log("📄 Stream reader done");
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              console.log("🏁 Received [DONE] marker");
              continue;
            }
            
            try {
              const chunk: GeminiStreamChunk = JSON.parse(data);
              
              // Handle finish reason but don't terminate early
              if (chunk.candidates?.[0]?.finishReason) {
                console.log("🔄 Chunk with finishReason:", chunk.candidates[0].finishReason);
                yield chunk; // Still yield this chunk
              } else {
                yield chunk; // Yield normal content chunks
              }
            } catch (parseError) {
              console.warn('⚠️ Failed to parse SSE data:', data, parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
      console.log("✅ Stream iterator completed");
    }
  }
} 