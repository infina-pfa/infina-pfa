import { useState, useEffect, useCallback, useRef } from "react";
import { 
  OnboardingState, 
  OnboardingMessage, 
  ComponentResponse,
  UseOnboardingChatReturn,
  UserProfile,
} from "@/lib/types/onboarding.types";
import { useAppTranslation } from "@/hooks/use-translation";
import { onboardingService } from "@/lib/services/onboarding.service";

export const useOnboardingChat = (
  userId: string,
  onComplete: () => void 
): UseOnboardingChatReturn => {
  const { t, i18n } = useAppTranslation(["onboarding", "common"]);
  
  // Core state
  const [state, setState] = useState<OnboardingState>({
    step: "ai_welcome",
    userProfile: { name: "" },
    chatMessages: [],
    currentQuestion: null,
    isComplete: false,
    conversationId: null,
    userId,
  });
  
  const [messages, setMessages] = useState<OnboardingMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasStartedAI, setHasStartedAI] = useState(false);
  const [hasInitialHistorySaved, setHasInitialHistorySaved] = useState(false);

  // Ref to prevent double initialization in Strict Mode
  const hasInitialized = useRef(false);

  // Initialize onboarding
  useEffect(() => {
    if (userId && !hasInitialized.current) {
      hasInitialized.current = true;
      initializeOnboarding();
    }
  }, [userId]);

  const initializeOnboarding = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const initialState = await onboardingService.initializeOnboarding(userId);
      setState(initialState);
      
      // Check if there's existing chat history
      if (initialState.conversationId) {
        const hasHistory = await onboardingService.hasExistingChatHistory(initialState.conversationId);
        
        if (hasHistory) {
          // Load existing chat history
          await loadChatHistory(initialState.conversationId);
        } else {
          // Show initial welcome message and introduction template WITHOUT calling AI
          showInitialWelcomeFlow();
        }
      } else {
        // Show initial welcome message if no conversation ID
        showInitialWelcomeFlow();
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("initializationFailed");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChatHistory = async (conversationId: string) => {
    try {
      const { messages: chatHistory } = await onboardingService.loadChatHistory(conversationId);
      
      // Convert chat history to OnboardingMessage format - simplified version
      const onboardingMessages: OnboardingMessage[] = chatHistory.map((msg) => {
        const chatMsg = msg as {
          id: string;
          sender: 'user' | 'ai' | 'system';
          content: string;
          created_at: string;
          component_id?: string;
          metadata?: Record<string, unknown>;
        };
        
        // Note: Component reconstruction will be handled by the conversation flow
        // For now, just preserve the basic message structure
        const component = undefined;
        
        return {
          id: chatMsg.id,
          type: chatMsg.sender === 'user' ? 'user' : 'ai',
          content: chatMsg.content,
          timestamp: new Date(chatMsg.created_at),
          component,
          metadata: chatMsg.metadata
        };
      });
      
      setMessages(onboardingMessages);
      
      // Mark that initial history is already saved (since we loaded it from DB)
      if (onboardingMessages.length > 0) {
        setHasInitialHistorySaved(true);
      }
      
      // If we have chat history, user can continue from where they left off
      console.log(`✅ Loaded ${onboardingMessages.length} messages from chat history`);
      
      // Check if there are any component messages that might need user interaction
      const componentMessages = onboardingMessages.filter(msg => 
        msg.metadata?.component
      );
      
      if (componentMessages.length > 0) {
        console.log(`🔧 Found ${componentMessages.length} component messages in history`);
      }
      
      // If the last message is from AI and user hasn't responded, they can continue
      const lastMessage = onboardingMessages[onboardingMessages.length - 1];
      if (lastMessage?.type === 'ai') {
        console.log("💬 User can continue conversation from where they left off");
      }
      
    } catch (err) {
      console.error("❌ Failed to load chat history:", err);
      // If loading fails, show initial welcome flow
      showInitialWelcomeFlow();
    }
  };

  const saveChatMessage = async (
    sender: 'user' | 'ai' | 'system',
    content: string,
    componentId?: string,
    metadata?: Record<string, unknown>
  ) => {
    try {
      if (!state.conversationId) {
        console.warn("No conversation ID available for saving message");
        return;
      }
      
      // Use async save for better UX - doesn't block the UI
      await onboardingService.saveChatMessageAsync(
        state.conversationId,
        sender,
        content,
        componentId,
        metadata
      );
      
      console.log(`Queued ${sender} message for background processing`);
    } catch (error) {
      console.error("Failed to queue chat message:", error);
      // Don't throw error - continue with the flow even if saving fails
    }
  };

  const saveInitialConversationHistory = async () => {
    try {
      if (!state.conversationId) {
        console.warn("No conversation ID available for saving initial history");
        return;
      }

      if (hasInitialHistorySaved) {
        console.log("📋 Initial conversation history already saved, skipping...");
        return;
      }

      console.log("💾 Saving initial conversation history with proper timestamps...");

      // Use Vietnamese as default for now (same as showInitialWelcomeFlow)
      const isVietnamese = i18n.language === 'vi' || true;

      // Create timestamps with clear separation (5 seconds apart) to ensure correct order
      const baseTime = Date.now() - 60000; // Start 1 minute ago
      const welcomeTimestamp = new Date(baseTime).toISOString();
      const suggestionTimestamp = new Date(baseTime + 5000).toISOString(); // +5 seconds
      const componentTimestamp = new Date(baseTime + 10000).toISOString(); // +10 seconds

      console.log("🕐 Using timestamps:", {
        welcome: welcomeTimestamp,
        suggestion: suggestionTimestamp,
        component: componentTimestamp
      });

      // 1. Save welcome message (earliest timestamp)
      const fullWelcomeContent = isVietnamese 
        ? "Xin chào! Tôi là Fina, cố vấn tài chính AI của bạn 🤝\n\nTôi ở đây để giúp bạn kiểm soát tương lai tài chính của mình. Tôi có thể:\n• Giúp bạn lập ngân sách và theo dõi chi tiêu\n• Tư vấn chiến lược đầu tư phù hợp\n• Hỗ trợ lập kế hoạch cho các mục tiêu tài chính\n• Phân tích tình hình tài chính và đưa ra lời khuyên cá nhân hóa\n\nĐể bắt đầu, tôi cần tìm hiểu một chút về bạn. Điều này sẽ giúp tôi cung cấp lời khuyên phù hợp nhất với nhu cầu của bạn."
        : "Hello! I'm Fina, your AI financial advisor 🤝\n\nI'm here to help you take control of your financial future. I can:\n• Help you create budgets and track spending\n• Advise on suitable investment strategies\n• Support planning for financial goals\n• Analyze your financial situation and provide personalized advice\n\nTo get started, I need to learn a bit about you. This will help me provide advice that best suits your needs.";

      // Use synchronous save for initial history to ensure correct order
      await onboardingService.saveChatMessage(
        state.conversationId,
        'ai',
        fullWelcomeContent,
        undefined,
        undefined,
        welcomeTimestamp
      );

      // 2. Save suggestion message (2nd timestamp)
      const fullSuggestionContent = isVietnamese
        ? "Hãy giới thiệu về bản thân bạn nhé! Bạn có thể chia sẻ về:"
        : "Please introduce yourself! You can share about:";

      await onboardingService.saveChatMessage(
        state.conversationId,
        'ai',
        fullSuggestionContent,
        undefined,
        undefined,
        suggestionTimestamp
      );

      // 3. Save introduction component (3rd timestamp)
      const introComponentId = `introduction_template_${Date.now()}`;
      const introComponentContent = isVietnamese
        ? "Giới thiệu về bản thân bạn"
        : "Introduce yourself";

      await onboardingService.saveChatMessage(
        state.conversationId,
        'ai',
        introComponentContent,
        introComponentId,
        {
          component: {
            type: "introduction_template",
            title: introComponentContent,
            context: {
              template: isVietnamese
                ? "Tôi tên là Tuấn, 24 tuổi, đang sống tại TPHCM. Tôi làm văn phòng với thu nhập hàng tháng khoảng 10 triệu VND. Hiện tại tôi muốn sớm đạt được tự do tài chính."
                : "My name is Devin, I'm 24 years old, living in New York. I work as a Software Engineer with a monthly income of about 5000 dollars. Currently, I want to get a house in New York.",
              suggestions: isVietnamese
                ? [
                    "Tôi mới bắt đầu tìm hiểu về quản lý tài chính cá nhân",
                    "Tôi muốn bắt đầu đầu tư nhưng không biết bắt đầu từ đâu",
                    "Tôi cần giúp đỡ để lập ngân sách hàng tháng hiệu quả"
                  ]
                : [
                    "I'm just starting to learn about personal finance management",
                    "I want to start investing but don't know where to begin",
                    "I need help creating an effective monthly budget"
                  ]
            },
            isCompleted: false
          }
        },
        componentTimestamp
      );

      console.log("✅ Successfully saved complete initial conversation history in correct order");
      setHasInitialHistorySaved(true);
    } catch (error) {
      console.error("❌ Failed to save initial conversation history:", error);
    }
  };

  const showInitialWelcomeFlow = () => {
    // Use Vietnamese as default for now
    const isVietnamese = i18n.language === 'vi' || true; // Force Vietnamese for testing
    
    // Start with empty messages to show chat interface immediately
    setMessages([]);
    
    // Simulate AI thinking before first message
    setIsAIThinking(true);
    
    // Stream welcome message after a delay
    setTimeout(() => {
      setIsAIThinking(false);
      setIsStreaming(true);
      
      const welcomeMessage: OnboardingMessage = {
        id: `welcome-${Date.now()}`,
        type: "ai",
        content: "",
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessage]);
      
      // Stream the welcome content character by character
      const fullWelcomeContent = isVietnamese 
        ? "Xin chào! Tôi là Fina, cố vấn tài chính AI của bạn 🤝\n\nTôi ở đây để giúp bạn kiểm soát tương lai tài chính của mình. Tôi có thể:\n• Giúp bạn lập ngân sách và theo dõi chi tiêu\n• Tư vấn chiến lược đầu tư phù hợp\n• Hỗ trợ lập kế hoạch cho các mục tiêu tài chính\n• Phân tích tình hình tài chính và đưa ra lời khuyên cá nhân hóa\n\nĐể bắt đầu, tôi cần tìm hiểu một chút về bạn. Điều này sẽ giúp tôi cung cấp lời khuyên phù hợp nhất với nhu cầu của bạn."
        : "Hello! I'm Fina, your AI financial advisor 🤝\n\nI'm here to help you take control of your financial future. I can:\n• Help you create budgets and track spending\n• Advise on suitable investment strategies\n• Support planning for financial goals\n• Analyze your financial situation and provide personalized advice\n\nTo get started, I need to learn a bit about you. This will help me provide advice that best suits your needs.";
      
      let currentIndex = 0;
      const streamInterval = setInterval(() => {
        if (currentIndex < fullWelcomeContent.length) {
          const chunkSize = Math.floor(Math.random() * 4) + 2; // Random chunk size 2-5 characters
          currentIndex += chunkSize;
          
          setMessages(prev => prev.map(msg => 
            msg.id === welcomeMessage.id 
              ? { ...msg, content: fullWelcomeContent.slice(0, currentIndex) }
              : msg
          ));
        } else {
          clearInterval(streamInterval);
          setIsStreaming(false);
          
          // After welcome message completes, show thinking again before suggestion
          setTimeout(() => {
            setIsAIThinking(true);
            
            setTimeout(() => {
              setIsAIThinking(false);
              setIsStreaming(true);
              
              // Add suggestion message with streaming
              const suggestionMessage: OnboardingMessage = {
                id: `suggestion-${Date.now()}`,
                type: "ai",
                content: "",
                timestamp: new Date(),
              };
              
              setMessages(prev => [...prev, suggestionMessage]);
              
              const fullSuggestionContent = isVietnamese
                ? "Hãy giới thiệu về bản thân bạn nhé! Bạn có thể chia sẻ về:"
                : "Please introduce yourself! You can share about:";
              
              let suggestionIndex = 0;
              const suggestionInterval = setInterval(() => {
                if (suggestionIndex < fullSuggestionContent.length) {
                  const chunkSize = Math.floor(Math.random() * 4) + 2;
                  suggestionIndex += chunkSize;
                  
                  setMessages(prev => prev.map(msg => 
                    msg.id === suggestionMessage.id 
                      ? { ...msg, content: fullSuggestionContent.slice(0, suggestionIndex) }
                      : msg
                  ));
                } else {
                  clearInterval(suggestionInterval);
                  setIsStreaming(false);
                  
                  // Show component after suggestion completes
                  setTimeout(() => {
                    // Add introduction template component with a fade-in effect
                    const introComponentId = `introduction_template_${Date.now()}`;
                    const introComponent: OnboardingMessage = {
                      id: `intro-component-${Date.now()}`,
                      type: "ai",
                      content: isVietnamese
                        ? "Giới thiệu về bản thân bạn"
                        : "Introduce yourself",
                      timestamp: new Date(),
                      component: {
                        id: introComponentId,
                        type: "introduction_template",
                        title: isVietnamese
                          ? "Giới thiệu về bản thân bạn"
                          : "Introduce yourself",
                        context: {
                          template: isVietnamese
                            ? "Tôi tên là Tuấn, 24 tuổi, đang sống tại TPHCM. Tôi làm văn phòng với thu nhập hàng tháng khoảng 10 triệu VND. Hiện tại tôi muốn sớm đạt được tự do tài chính."
                            : "My name is Devin, I'm 24 years old, living in New York. I work as a Software Engineer with a monthly income of about 5000 dollars. Currently, I want to get a house in New York.",
                          suggestions: isVietnamese
                            ? [
                                "Tôi mới bắt đầu tìm hiểu về quản lý tài chính cá nhân",
                                "Tôi muốn bắt đầu đầu tư nhưng không biết bắt đầu từ đâu",
                                "Tôi cần giúp đỡ để lập ngân sách hàng tháng hiệu quả"
                              ]
                            : [
                                "I'm just starting to learn about personal finance management",
                                "I want to start investing but don't know where to begin",
                                "I need help creating an effective monthly budget"
                              ]
                        },
                        isCompleted: false
                      }
                    };
                    
                    setMessages(prev => [...prev, introComponent]);
                    console.log("📝 Initial conversation flow completed (will be saved when user submits)");
                  }, 500); // Small delay before showing component
                }
              }, 15); // Faster streaming for shorter message
            }, 800); // Thinking delay before suggestion
          }, 1000); // Delay after welcome message
        }
      }, 20); // Streaming speed for welcome message
    }, 1500); // Initial delay to show chat interface first
  };

  const startOnboardingConversation = async (initialMessage: string, initialState: OnboardingState) => {
    console.log("Starting onboarding conversation with user input:", initialMessage);
    
    // ✨ IMPROVED: Use same conversation history mapping as processUserMessage
    const conversationHistory = messages.map(msg => {
      let content = msg.content || "";
      
      // For AI messages with components, include component context
      if (msg.type === "ai" && msg.component) {
        const component = msg.component;
        
        // Add component title and context to content
        content = `${content}${content ? "\n\n" : ""}[Component: ${component.type}]`;
        if (component.title) {
          content += `\nTitle: ${component.title}`;
        }
        
        // If component is completed, include the user's response
        if (component.isCompleted && component.response) {
          const responseText = getResponseText(component.response);
          content += `\nUser Response: ${responseText}`;
        }
      }
      
      return {
        id: msg.id,
        content: content,
        sender: msg.type === "user" ? "user" as const : "ai" as const,
        timestamp: msg.timestamp.toISOString(),
      };
    });
    
    // 🔍 DEBUG: Log conversation history at start
    console.log(`🔍 Starting with full conversation history: ${conversationHistory.length} messages`);
    console.log("📋 Starting conversation history:");
    conversationHistory.forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.sender}] (${msg.id}): "${msg.content}" (${msg.content.length} chars)`);
    });
    
    // Start AI conversation with the user's introduction
    await streamOnboardingAI({
      message: initialMessage,
      conversationHistory,
      userProfile: initialState.userProfile,
      currentStep: initialState.step
    });
    
    setHasStartedAI(true);
  };

  const sendMessage = useCallback(async (message: string) => {
    try {
      // Add user message
      const userMessage: OnboardingMessage = {
        id: `user-${Date.now()}`,
        type: "user",
        content: message,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Save user message to database
      await saveChatMessage('user', message);
      
      // If this is the first user message, start AI conversation
      if (!hasStartedAI) {
        await startOnboardingConversation(message, state);
      } else {
        // Process the message normally
        await processUserMessage(message);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("messageFailed");
      setError(errorMessage);
    }
  }, [state, messages, hasStartedAI, t, saveChatMessage]);

  const processUserMessage = async (message: string) => {
    // Prepare conversation history - include ALL AI and user messages for full context
    // ✨ IMPROVED: Include component details and response information
    const conversationHistory = messages.map(msg => {
      let content = msg.content || "";
      
      // For AI messages with components, include component context
      if (msg.type === "ai" && msg.component) {
        const component = msg.component;
        
        // Add component title and context to content
        content = `${content}${content ? "\n\n" : ""}[Component: ${component.type}]`;
        if (component.title) {
          content += `\nTitle: ${component.title}`;
        }
        
        // If component is completed, include the user's response
        if (component.isCompleted && component.response) {
          const responseText = getResponseText(component.response);
          content += `\nUser Response: ${responseText}`;
        }
      }
      
      return {
        id: msg.id,
        content: content,
        sender: msg.type === "user" ? "user" as const : "ai" as const,
        timestamp: msg.timestamp.toISOString(),
      };
    });

    // Add current message
    conversationHistory.push({
      id: `current-${Date.now()}`,
      content: message,
      sender: "user" as const,
      timestamp: new Date().toISOString(),
    });

    // 🔍 DEBUG: Log detailed conversation history to identify issues
    console.log(`🔍 Sending full conversation history: ${conversationHistory.length} messages`);
    console.log("📋 Detailed conversation history:");
    conversationHistory.forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.sender}] (${msg.id}): "${msg.content}" (${msg.content.length} chars)`);
    });
    
    // 🔍 DEBUG: Check for empty or short messages that might be causing issues
    const emptyMessages = conversationHistory.filter(msg => !msg.content || msg.content.length < 5);
    if (emptyMessages.length > 0) {
      console.warn(`⚠️ Found ${emptyMessages.length} messages with empty/short content:`, emptyMessages);
    }
    
    await streamOnboardingAI({
      message,
      conversationHistory,
      userProfile: state.userProfile,
      currentStep: state.step
    });
  };

  const streamOnboardingAI = async (request: {
    message: string;
    conversationHistory: Array<{
      id: string;
      content: string;
      sender: "user" | "ai";
      timestamp: string;
    }>;
    userProfile: UserProfile;
    currentStep: string;
  }) => {
    try {
      setIsAIThinking(true);
      setIsStreaming(true);
      setError(null);

      const response = await fetch('/api/onboarding/ai-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader');
      }

      const decoder = new TextDecoder();
      let currentAIMessage: OnboardingMessage | null = null;
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsStreaming(false);
              setIsAIThinking(false);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'response_created') {
                // Initialize new AI message
                currentAIMessage = {
                  id: parsed.response_id || `ai-${Date.now()}`,
                  type: "ai",
                  content: "",
                  timestamp: new Date(),
                };
                setMessages(prev => [...prev, currentAIMessage!]);
                fullContent = "";
              } else if (parsed.type === 'response_output_text_streaming') {
                // Update streaming content
                if (currentAIMessage && parsed.response_id === currentAIMessage.id) {
                  fullContent += parsed.content;
                  currentAIMessage.content = fullContent;
                  setMessages(prev => prev.map(msg => 
                    msg.id === currentAIMessage!.id 
                      ? { ...currentAIMessage! }
                      : msg
                  ));
                }
              } else if (parsed.type === 'response_output_text_done') {
                // Finalize text content
                if (currentAIMessage) {
                  currentAIMessage.content = parsed.content;
                  setMessages(prev => prev.map(msg => 
                    msg.id === currentAIMessage!.id 
                      ? { ...currentAIMessage! }
                      : msg
                  ));
                  
                  // Save AI message to database
                  await saveChatMessage('ai', parsed.content);
                }
              } else if (parsed.type === 'show_component') {
                const { payload } = parsed;
                const componentMessage: OnboardingMessage = {
                  id: payload.componentId,
                  type: 'ai',
                  content: payload.title,
                  timestamp: new Date(),
                  component: {
                    id: payload.componentId,
                    type: payload.componentType,
                    title: payload.title,
                    context: payload.context,
                    isCompleted: false
                  }
                };
                setMessages(prev => [...prev, componentMessage]);
                
                // Save component message to database
                await saveChatMessage('ai', payload.title, payload.componentId, {
                  component: {
                    type: payload.componentType,
                    title: payload.title,
                    context: payload.context,
                    isCompleted: false
                  }
                });
              } else if (parsed.type === 'tool_error') {
                console.error("Tool error from server:", parsed);
                
                // Show more detailed error information
                const errorMessage = parsed.error || "Unknown tool error occurred";
                const toolName = parsed.tool_name || "unknown tool";
                
                console.error(`❌ Tool Error - ${toolName}: ${errorMessage}`);
                
                // Optionally show details if available
                if (parsed.details) {
                  console.error("Error details:", parsed.details);
                }
                
                // Don't set error or show retry messages - just log it
                // The AI will continue with text instead of showing component
              } else if (parsed.type === 'onboarding_complete') {
                console.log("Onboarding complete signal received from server.");
                onComplete();
                setIsStreaming(false);
                setIsAIThinking(false);
              } else if (parsed.type === 'error') {
                setError(parsed.error);
                const errorMessage: OnboardingMessage = {
                    id: `error-${Date.now()}`,
                    type: 'ai',
                    content: `An unexpected error occurred: ${parsed.error}`,
                    timestamp: new Date(),
                    isError: true,
                };
                setMessages(prev => [...prev, errorMessage]);
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }
    } catch (err) {
      console.error('Streaming error:', err);
      setError(err instanceof Error ? err.message : 'Streaming failed');
    } finally {
      setIsStreaming(false);
      setIsAIThinking(false);
    }
  };

  const handleComponentResponse = useCallback(async (
    componentId: string,
    response: ComponentResponse
  ) => {
    try {
      // Save the response to backend
      await onboardingService.saveUserResponse(componentId, response);
      
      // 🔧 BUILD UPDATED MESSAGES MANUALLY to avoid async state timing issues
      let updatedMessages = [...messages];
      
      // Update component as completed in our manual array
      updatedMessages = updatedMessages.map(msg => {
        if (msg.component?.id === componentId) {
          return {
            ...msg,
            component: {
              ...msg.component,
              isCompleted: true,
              response,
            },
          };
        }
        return msg;
      });

      // Update user profile based on response
      await updateProfileFromResponse(response);
      
      // Get response text for the message
      const responseText = getResponseText(response);
      
      // Add user message to our manual array
      const userMessage: OnboardingMessage = {
        id: `user-${Date.now()}`,
        type: "user",
        content: responseText,
        timestamp: new Date(),
      };
      
      updatedMessages = [...updatedMessages, userMessage];
      
      // Save user response to database
      await saveChatMessage('user', responseText, componentId, {
        componentResponse: response
      });
      
      // 🔧 UPDATE STATE with complete messages array
      setMessages(updatedMessages);
      
      // 🔧 BUILD CONVERSATION HISTORY from our updated array (not from state)
      const conversationHistory = updatedMessages.map(msg => {
        let content = msg.content || "";
        
        // For AI messages with components, include component context
        if (msg.type === "ai" && msg.component) {
          const component = msg.component;
          
          // Add component title and context to content
          content = `${content}${content ? "\n\n" : ""}[Component: ${component.type}]`;
          if (component.title) {
            content += `\nTitle: ${component.title}`;
          }
          
          // If component is completed, include the user's response
          if (component.isCompleted && component.response) {
            const completedResponseText = getResponseText(component.response);
            content += `\nUser Response: ${completedResponseText}`;
          }
        }
        
        return {
          id: msg.id,
          content: content,
          sender: msg.type === "user" ? "user" as const : "ai" as const,
          timestamp: msg.timestamp.toISOString(),
        };
      });

      // 🔍 DEBUG: Log the manually built conversation history
      console.log(`🔧 Manually built conversation history: ${conversationHistory.length} messages`);
      console.log("📋 Manual conversation history (with completed components):");
      conversationHistory.forEach((msg, index) => {
        console.log(`${index + 1}. [${msg.sender}] (${msg.id}): "${msg.content}" (${msg.content.length} chars)`);
      });
      
      // If this is the first component response (introduction), start AI conversation
      if (!hasStartedAI && componentId.includes('introduction_template')) {
        // Save the initial conversation history first (welcome + suggestion + component)
        await saveInitialConversationHistory();
        
        // For introduction, use manual conversation history
        await streamOnboardingAI({
          message: responseText,
          conversationHistory,
          userProfile: state.userProfile,
          currentStep: state.step
        });
        setHasStartedAI(true);
      } else {
        // Continue conversation with AI for subsequent responses using manual history
        await streamOnboardingAI({
          message: responseText,
          conversationHistory,
          userProfile: state.userProfile,
          currentStep: state.step
        });
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("responseFailed");
      setError(errorMessage);
    }
  }, [state, hasStartedAI, t, messages]);

  const updateProfileFromResponse = async (response: ComponentResponse) => {
    const profileUpdates: Partial<UserProfile> = {};

    // Parse different types of responses
    if (response.textValue) {
      // Extract information from text responses
      const text = response.textValue.toLowerCase();
      
      // Extract name
      if (text.includes("tên") || text.includes("name")) {
        const namePatterns = [
          /(?:tên|name)(?:\s+(?:là|is))?(?:\s+tôi)?(?:\s+)?(?:là)?(?:\s+)?([^,.\n,]+)/i,
          /tôi\s+là\s+([^,.\n]+)/i,
          /mình\s+là\s+([^,.\n]+)/i
        ];
        
        for (const pattern of namePatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            profileUpdates.name = match[1].trim();
            break;
          }
        }
      }

      // Extract age
      const ageMatch = text.match(/(\d+)\s*tuổi|age.*?(\d+)|(\d+).*?(?:years?\s+old)/i);
      if (ageMatch) {
        const age = parseInt(ageMatch[1] || ageMatch[2] || ageMatch[3]);
        if (age && age >= 15 && age <= 100) {
          profileUpdates.age = age;
        }
      }

      // Extract income
      const incomeMatch = text.match(/thu\s*nhập.*?(\d+(?:\.\d+)?)\s*(?:triệu|tr)|income.*?(\d+(?:\.\d+)?)\s*(?:million|mil)/i);
      if (incomeMatch) {
        const income = parseFloat(incomeMatch[1] || incomeMatch[2]) * 1000000;
        profileUpdates.income = income;
      }

      // Extract expenses  
      const expenseMatch = text.match(/tiêu.*?(\d+(?:\.\d+)?)\s*(?:triệu|tr)|spend.*?(\d+(?:\.\d+)?)\s*(?:million|mil)/i);
      if (expenseMatch) {
        const expenses = parseFloat(expenseMatch[1] || expenseMatch[2]) * 1000000;
        profileUpdates.expenses = expenses;
      }
    }

    // Handle other response types
    if (response.financialValue) {
      // This would need context about what type of financial input it was
      // For now, we'll need the component to specify the field
    }

    if (response.selectedOption) {
      // Handle goal selection, risk tolerance, etc.
      // This would need component context to know which field to update
    }

    if (Object.keys(profileUpdates).length > 0) {
      await onboardingService.updateUserProfile(profileUpdates);
      
      setState(prev => ({
        ...prev,
        userProfile: { ...prev.userProfile, ...profileUpdates },
      }));
    }
  };

  const getResponseText = (response: ComponentResponse): string => {
    if (response.textValue) {
      return response.textValue;
    } else if (response.selectedOption) {
      return response.selectedOption;
    } else if (response.financialValue !== undefined && response.financialValue !== null) {
      // ✨ IMPROVED: More descriptive financial value formatting
      const formattedValue = response.financialValue.toLocaleString('vi-VN');
      return `${formattedValue} VND`;
    } else if (response.rating !== undefined && response.rating !== null) {
      return `Rated ${response.rating}/5`;
    } else if (response.sliderValue !== undefined && response.sliderValue !== null) {
      return `${response.sliderValue}%`;
    }
    return "Completed"; // More descriptive than "ok"
  };

  return {
    state,
    messages,
    isLoading,
    isAIThinking,
    isStreaming,
    error,
    sendMessage,
    handleComponentResponse,
  };
}; 