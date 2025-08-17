"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useConversation } from "@elevenlabs/react";
import { useAuthContext } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useAppTranslation } from "@/hooks/use-translation";
import { 
  Mic, 
  MessageCircle, 
  X, 
  PhoneOff,
  Minimize2,
  Maximize2,
  Send,
  Keyboard,
  Sparkles,
  Volume2
} from "lucide-react";

interface ConversationMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  isInterim?: boolean;
}

type ViewMode = 'orb' | 'minimized' | 'expanded' | 'fullscreen';

export function CustomVoiceChat() {
  const { user } = useAuthContext();
  const router = useRouter();
  const { t } = useAppTranslation(["chat", "common"]);
  
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('orb');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  
  // Audio state
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Initialize position on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
    }
  }, []);
  
  // Conversation state
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [currentAgentMessage, setCurrentAgentMessage] = useState("");
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [textInput, setTextInput] = useState("");
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Voice conversation connected");
      setIsConnected(true);
      setIsConnecting(false);
      addMessage("agent", t("voiceChatConnected", { ns: "chat" }) || "Voice chat connected");
      initAudioVisualization();
    },
    onDisconnect: () => {
      console.log("Voice conversation disconnected");
      setIsConnected(false);
      setCurrentTranscript("");
      setCurrentAgentMessage("");
      setIsAgentSpeaking(false);
      addMessage("agent", t("voiceChatDisconnected", { ns: "chat" }) || "Voice chat disconnected");
      cleanupAudioVisualization();
    },
    onUserTranscript: (transcript: {
      text: string;
      isFinal: boolean;
    }) => {
      console.log("User transcript:", transcript);
      
      if (transcript.isFinal) {
        if (transcript.text) {
          addMessage("user", transcript.text);
        }
        setCurrentTranscript("");
      } else {
        setCurrentTranscript(transcript.text);
      }
    },
    onAgentMessage: (message: {
      text: string;
      isFinal: boolean;
    }) => {
      console.log("Agent message:", message);
      
      if (message.isFinal) {
        if (message.text) {
          addMessage("agent", message.text);
        }
        setCurrentAgentMessage("");
        setIsAgentSpeaking(false);
      } else {
        setCurrentAgentMessage(message.text);
        setIsAgentSpeaking(true);
      }
    },
    onMessage: ({ message, source }: { message: string; source: 'user' | 'ai' }) => {
      console.log("Legacy message format:", { message, source });
      
      if (source === 'user' && message) {
        addMessage("user", message);
      } else if (source === 'ai' && message) {
        addMessage("agent", message);
      }
    },
    onStatusChange: ({ status }: { status: string }) => {
      console.log("Status change:", status);
      
      if (status === "connected") {
        setIsConnected(true);
        setIsConnecting(false);
      } else if (status === "disconnected") {
        setIsConnected(false);
        setIsConnecting(false);
      } else if (status === "connecting") {
        setIsConnecting(true);
      }
    },
    onError: (error: Error | unknown) => {
      console.error("Voice conversation error:", error);
      setIsConnecting(false);
      addMessage("agent", t("voiceChatError", { ns: "chat" }) || "Sorry, there was an error with the voice connection.");
    },
    clientTools: {
      RedirectToExternalURL: (params: { url?: string; [key: string]: unknown }) => {
        const url = params.url;
        console.log("RedirectToExternalURL called with URL:", url);
        
        if (!url || typeof url !== "string") {
          console.error("No URL provided to RedirectToExternalURL");
          return "No URL provided";
        }

        try {
          const parsedUrl = new URL(url, window.location.origin);
          const currentOrigin = window.location.origin;
          
          if (parsedUrl.origin === currentOrigin) {
            const internalPath = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
            console.log("Internal navigation to:", internalPath);
            router.push(internalPath);
            return `Navigated to internal page: ${internalPath}`;
          } else {
            console.log("External navigation to:", url);
            window.open(url, "_blank", "noopener,noreferrer");
            return `Opened external URL: ${url}`;
          }
        } catch (error) {
          if (url.startsWith("/")) {
            console.log("Direct internal navigation to:", url);
            router.push(url);
            return `Navigated to: ${url}`;
          } else {
            console.error("Invalid URL provided:", url, error);
            return "Invalid URL provided";
          }
        }
      }
    }
  });

  // Initialize audio visualization
  const initAudioVisualization = () => {
    if (!audioContextRef.current) {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
      }
    }
    drawWaveform();
  };

  // Cleanup audio visualization
  const cleanupAudioVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Draw waveform visualization
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(0, 85, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(0, 85, 255, 0.3)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }

      // Update audio level for orb animation
      const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
      setAudioLevel(average / 255);
    };

    draw();
  };

  const addMessage = (type: 'user' | 'agent', content: string) => {
    const newMessage: ConversationMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentTranscript, currentAgentMessage]);

  const startConversation = async () => {
    try {
      setIsConnecting(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const conversationId = await conversation.startSession({
        agentId: "agent_2301k2jes0nbe4zte8ycedhzh60a",
        connectionType: "webrtc",
        userId: user?.id || undefined,
      });
      
      console.log("Conversation started with ID:", conversationId);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      setIsConnecting(false);
      addMessage("agent", t("microphonePermissionDenied", { ns: "chat" }) || "Microphone permission is required for voice chat.");
    }
  };

  const endConversation = async () => {
    try {
      await conversation.endSession();
      setIsConnected(false);
      setMessages([]);
      setCurrentTranscript("");
      
      // Stop media stream tracks
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    } catch (error) {
      console.error("Failed to end conversation:", error);
    }
  };


  const sendTextMessage = () => {
    if (!textInput.trim()) return;
    
    // Add message to chat
    addMessage("user", textInput);
    
    // Send to conversation API if available
    if (conversation.sendUserMessage) {
      conversation.sendUserMessage(textInput);
    }
    
    setTextInput("");
  };

  // Handle drag functionality
  const handleDragStart = (clientX: number, clientY: number) => {
    if (viewMode !== 'orb') return;
    
    setIsDragging(true);
    setHasDragged(false);
    const startX = clientX - position.x;
    const startY = clientY - position.y;
    setDragOffset({ x: startX, y: startY });
    setDragStartPos({ x: clientX, y: clientY });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    // Check if we've moved enough to consider it a drag (5px threshold)
    const dragDistance = Math.sqrt(
      Math.pow(clientX - dragStartPos.x, 2) + 
      Math.pow(clientY - dragStartPos.y, 2)
    );
    
    if (dragDistance > 5) {
      setHasDragged(true);
    }
    
    const newX = Math.max(0, Math.min(window.innerWidth - 56, clientX - dragOffset.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 56, clientY - dragOffset.y));
    
    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    
    // Magnetic dock to edges
    const threshold = 50;
    const newPosition = { ...position };
    
    if (position.x < threshold) {
      newPosition.x = 20;
    } else if (position.x > window.innerWidth - 56 - threshold) {
      newPosition.x = window.innerWidth - 76;
    }
    
    if (position.y < threshold) {
      newPosition.y = 20;
    } else if (position.y > window.innerHeight - 56 - threshold) {
      newPosition.y = window.innerHeight - 76;
    }
    
    setPosition(newPosition);
    
    // Reset drag flag after a short delay to prevent click interference
    setTimeout(() => setHasDragged(false), 100);
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  }, [isDragging, dragOffset, dragStartPos]);

  const handleMouseUp = useCallback(() => {
    handleDragEnd();
  }, [position]);

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  }, [isDragging, dragOffset, dragStartPos]);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [position]);

  useEffect(() => {
    if (isDragging) {
      // Mouse events
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Touch events
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Render floating orb
  if (viewMode === 'orb') {
    return (
      <div
        ref={orbRef}
        className="fixed z-50 cursor-move select-none touch-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isDragging ? 0.8 : 1
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Outer glow effect - subtle blue accent */}
        <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
          isConnected 
            ? 'bg-[#0055FF]/20 blur-md' 
            : 'bg-gray-300/30 blur-sm'
        }`}
          style={{
            transform: `scale(${isConnected ? 1.3 + audioLevel * 0.2 : 1.2})`,
            animation: isConnected ? 'pulse 3s infinite' : 'pulse 4s infinite'
          }}
        />
        
        {/* Main orb - smaller and lighter */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Only expand if we haven't dragged
            if (!hasDragged) {
              setViewMode('expanded');
            }
          }}
          className={`relative w-14 h-14 rounded-full transition-all duration-300 transform ${
            !isDragging ? 'hover:scale-110' : 'scale-95'
          } ${
            isConnected 
              ? 'bg-white border-2 border-[#0055FF]' 
              : 'bg-white border-2 border-gray-300'
          }`}
        >
          {/* Icon */}
          <div className="relative z-10 flex items-center justify-center h-full">
            {isConnecting ? (
              <div className="animate-spin">
                <Sparkles size={20} className="text-[#0055FF]" />
              </div>
            ) : isAgentSpeaking ? (
              <div className="animate-pulse">
                <Volume2 size={20} className="text-[#0055FF]" />
              </div>
            ) : currentTranscript ? (
              <div className="animate-pulse">
                <Mic size={20} className="text-[#0055FF]" />
              </div>
            ) : (
              <MessageCircle size={20} className="text-[#0055FF]" />
            )}
          </div>
          
          {/* Status indicator */}
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
            isConnected ? 'bg-[#2ECC71]' : isConnecting ? 'bg-[#FFC107] animate-pulse' : 'bg-gray-400'
          }`} />
        </button>
        
        {/* Notification badge */}
        {messages.length > 0 && (
          <div className="absolute -top-1 -right-1 bg-[#F44336] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-bounce">
            {messages.length > 9 ? '9+' : messages.length}
          </div>
        )}
      </div>
    );
  }

  // Render minimized bar
  if (viewMode === 'minimized') {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white rounded-full px-4 py-2 flex items-center gap-3 border border-[#E0E0E0]">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#2ECC71]' : 'bg-gray-400'} animate-pulse`} />
          <span className="text-gray-700 text-sm font-medium font-nunito">
            {isAgentSpeaking ? t("speaking", { ns: "chat" }) : currentTranscript ? t("listening", { ns: "chat" }) : t("voiceAssistant", { ns: "chat" })}
          </span>
          <button
            onClick={() => setViewMode('expanded')}
            className="p-1.5 hover:bg-[#F0F2F5] rounded-full transition-colors"
          >
            <Maximize2 size={14} className="text-gray-600" />
          </button>
          <button
            onClick={() => setViewMode('orb')}
            className="p-1.5 hover:bg-[#F0F2F5] rounded-full transition-colors"
          >
            <X size={14} className="text-gray-600" />
          </button>
        </div>
      </div>
    );
  }

  // Render expanded/fullscreen view
  return (
    <div className={`fixed z-50 ${
      viewMode === 'fullscreen' 
        ? 'inset-0' 
        : 'bottom-6 right-6 w-[380px] h-[520px]'
    }`}>
      <div className={`h-full bg-white rounded-xl flex flex-col border border-[#E0E0E0] overflow-hidden ${
        viewMode === 'fullscreen' ? '' : 'animate-slideUp'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#F0F2F5] border-b border-[#E0E0E0]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#E0E0E0]">
                <Sparkles size={20} className="text-[#0055FF]" />
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                isConnected ? 'bg-[#2ECC71]' : isConnecting ? 'bg-[#FFC107] animate-pulse' : 'bg-gray-400'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm font-nunito">
                {t("voiceAssistant", { ns: "chat" })}
              </h3>
              <p className="text-xs text-gray-600">
                {isConnected 
                  ? t("connected", { ns: "common" })
                  : isConnecting 
                    ? t("connecting", { ns: "common" }) 
                    : t("disconnected", { ns: "common" })
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('minimized')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Minimize"
            >
              <Minimize2 size={16} className="text-gray-600" />
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'fullscreen' ? 'expanded' : 'fullscreen')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={viewMode === 'fullscreen' ? "Exit fullscreen" : "Fullscreen"}
            >
              <Maximize2 size={16} className="text-gray-600" />
            </button>
            <button
              onClick={() => setViewMode('orb')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={t("close", { ns: "common" })}
            >
              <X size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Waveform Visualizer */}
        {isConnected && (isAgentSpeaking || currentTranscript) && (
          <div className="relative h-12 bg-gradient-to-b from-[#0055FF]/5 to-transparent">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              width={viewMode === 'fullscreen' ? window.innerWidth : 380}
              height={48}
            />
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-[#F6F7F9] voice-chat-messages">
          {messages.length === 0 && !isConnected && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-[#0055FF]/10 flex items-center justify-center mb-4 animate-pulse">
                <MessageCircle size={24} className="text-[#0055FF]" />
              </div>
              <p className="text-gray-600 text-sm mb-2 font-nunito">{t("startVoiceConversation", { ns: "chat" })}</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`mb-3 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={`max-w-[80%] p-3 rounded-xl ${
                  message.type === 'user'
                    ? 'bg-[#0055FF] text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm border border-[#E0E0E0]'
                }`}
              >
                <p className="text-sm font-nunito">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {/* Current transcript */}
          {currentTranscript && (
            <div className="mb-3 flex justify-end animate-fadeIn">
              <div className="max-w-[80%] p-3 rounded-xl bg-[#0055FF]/10 text-gray-700 rounded-br-sm">
                <p className="text-sm italic font-nunito">{currentTranscript}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1 h-1 bg-[#0055FF] rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#0055FF]">{t("listening", { ns: "chat" })}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Current agent message */}
          {currentAgentMessage && (
            <div className="mb-3 flex justify-start animate-fadeIn">
              <div className="max-w-[80%] p-3 rounded-xl bg-white text-gray-800 rounded-bl-sm border border-[#E0E0E0]">
                <p className="text-sm font-nunito">{currentAgentMessage}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1 h-1 bg-[#0055FF] rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#0055FF]">{t("speaking", { ns: "chat" })}</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area (for text mode) */}
        {inputMode === 'text' && isConnected && (
          <div className="p-3 border-t border-[#E0E0E0]">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendTextMessage())}
                placeholder={t("typeYourMessage", { ns: "chat" })}
                className="flex-1 px-3 py-2 bg-[#F0F2F5] rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-b-2 focus:border-[#0055FF] text-sm font-nunito"
              />
              <button
                onClick={sendTextMessage}
                className="p-2 bg-[#0055FF] hover:bg-[#0055FF]/90 text-white rounded-lg transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="p-4 bg-white border-t border-[#E0E0E0]">
          {/* Top Row: Connection Status and Mode Toggle */}
          <div className="flex items-center justify-between mb-3">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionQuality === 'excellent' ? 'bg-[#2ECC71]' :
                connectionQuality === 'good' ? 'bg-[#FFC107]' : 'bg-[#F44336]'
              }`} />
              <span className="text-xs text-gray-600 font-nunito">
                {connectionQuality === 'excellent' ? 'Excellent' :
                 connectionQuality === 'good' ? 'Good' : 'Poor'} connection
              </span>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center gap-1 bg-[#F0F2F5] rounded-lg p-0.5">
              <button
                onClick={() => setInputMode('voice')}
                className={`p-2 rounded transition-all ${
                  inputMode === 'voice' ? 'bg-white' : 'hover:bg-white/50'
                }`}
                aria-label="Voice mode"
              >
                <Mic size={16} className={inputMode === 'voice' ? 'text-[#0055FF]' : 'text-gray-600'} />
              </button>
              <button
                onClick={() => setInputMode('text')}
                className={`p-2 rounded transition-all ${
                  inputMode === 'text' ? 'bg-white' : 'hover:bg-white/50'
                }`}
                aria-label="Text mode"
              >
                <Keyboard size={16} className={inputMode === 'text' ? 'text-[#0055FF]' : 'text-gray-600'} />
              </button>
            </div>
          </div>

          {/* Main Action Button */}
          <div className="flex justify-center">
            {!isConnected ? (
              <button
                onClick={startConversation}
                disabled={isConnecting}
                className="flex items-center gap-2 px-6 py-3 bg-[#0055FF] hover:bg-[#0055FF]/90 disabled:bg-gray-400 text-white rounded-full transition-all font-medium font-nunito text-sm"
              >
                {isConnecting ? (
                  <div className="animate-spin">
                    <Sparkles size={18} />
                  </div>
                ) : (
                  <Mic size={18} />
                )}
                {isConnecting ? t("connecting", { ns: "common" }) : t("startVoiceChat", { ns: "chat" })}
              </button>
            ) : (
              <button
                onClick={endConversation}
                className="flex items-center gap-2 px-6 py-3 bg-[#F44336] hover:bg-[#F44336]/90 text-white rounded-full transition-all font-medium font-nunito text-sm"
              >
                <PhoneOff size={18} />
                {t("endCall", { ns: "chat" })}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomVoiceChat;