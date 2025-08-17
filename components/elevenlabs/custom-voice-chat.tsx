"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useConversation } from "@elevenlabs/react";
import { useAuthContext } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useAppTranslation } from "@/hooks/use-translation";
import { 
  Mic, 
  MicOff,
  Volume2, 
  VolumeX, 
  MessageCircle, 
  X, 
  PhoneOff,
  Minimize2,
  Maximize2,
  Send,
  Keyboard,
  Sparkles
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
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  
  // Audio state
  const [isMuted, setIsMuted] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
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
        gradient.addColorStop(0, 'rgba(0, 85, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(138, 43, 226, 0.8)');

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

  const toggleMute = () => {
    try {
      const newMuteState = !isMuted;
      conversation.setVolume?.({ volume: newMuteState ? 0 : 1 });
      setIsMuted(newMuteState);
    } catch (error) {
      console.error("Failed to toggle mute:", error);
    }
  };

  const toggleMicMute = () => {
    const newMuteState = !isMicMuted;
    setIsMicMuted(newMuteState);
    
    // Mute/unmute the actual microphone stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !newMuteState;
      });
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
  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode !== 'orb') return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = Math.max(0, Math.min(window.innerWidth - 80, e.clientX - dragOffset.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 80, e.clientY - dragOffset.y));
    
    setPosition({ x: newX, y: newY });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    
    // Magnetic dock to edges
    const threshold = 50;
    const newPosition = { ...position };
    
    if (position.x < threshold) {
      newPosition.x = 20;
    } else if (position.x > window.innerWidth - 80 - threshold) {
      newPosition.x = window.innerWidth - 100;
    }
    
    if (position.y < threshold) {
      newPosition.y = 20;
    } else if (position.y > window.innerHeight - 80 - threshold) {
      newPosition.y = window.innerHeight - 100;
    }
    
    setPosition(newPosition);
  }, [position]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Render floating orb
  if (viewMode === 'orb') {
    return (
      <div
        ref={orbRef}
        className="fixed z-50 cursor-move select-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Outer glow effect - more subtle */}
        <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
          isConnected 
            ? 'bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-blue-400/30 blur-lg' 
            : 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 blur-md'
        }`}
          style={{
            transform: `scale(${isConnected ? 1.3 + audioLevel * 0.3 : 1.2})`,
            animation: isConnected ? 'pulse 3s infinite' : 'pulse 4s infinite'
          }}
        />
        
        {/* Main orb */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setViewMode('expanded');
          }}
          className={`relative w-20 h-20 rounded-full transition-all duration-300 transform hover:scale-110 ${
            isConnected 
              ? 'bg-gradient-to-br from-blue-500/70 to-purple-500/70' 
              : 'bg-gradient-to-br from-gray-500/50 to-gray-600/50'
          } shadow-lg backdrop-blur-md border border-white/10`}
          style={{
            background: isConnected
              ? `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.15), transparent 70%), linear-gradient(135deg, #0055FF99, #8A2BE299)`
              : `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1), transparent 70%), linear-gradient(135deg, #6b7280, #4b5563)`
          }}
        >
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
          </div>
          
          {/* Icon */}
          <div className="relative z-10 flex items-center justify-center h-full">
            {isConnecting ? (
              <div className="animate-spin">
                <Sparkles size={28} className="text-white" />
              </div>
            ) : isAgentSpeaking ? (
              <div className="animate-pulse">
                <Volume2 size={28} className="text-white" />
              </div>
            ) : currentTranscript ? (
              <div className="animate-pulse">
                <Mic size={28} className="text-white" />
              </div>
            ) : (
              <MessageCircle size={28} className="text-white" />
            )}
          </div>
          
          {/* Status indicator */}
          <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
            isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'
          }`} />
        </button>
        
        {/* Notification badge */}
        {messages.length > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
            {messages.length}
          </div>
        )}
      </div>
    );
  }

  // Render minimized bar
  if (viewMode === 'minimized') {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-4 shadow-lg border border-gray-700/50">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'} animate-pulse`} />
          <span className="text-white text-sm font-medium">
            {isAgentSpeaking ? t("speaking", { ns: "chat" }) : currentTranscript ? t("listening", { ns: "chat" }) : t("voiceAssistant", { ns: "chat" })}
          </span>
          <button
            onClick={() => setViewMode('expanded')}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Maximize2 size={16} className="text-white" />
          </button>
          <button
            onClick={() => setViewMode('orb')}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={16} className="text-white" />
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
        : 'bottom-6 right-6 w-[420px] h-[600px]'
    }`}>
      <div className={`h-full bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-xl flex flex-col border border-gray-700/50 overflow-hidden ${
        viewMode === 'fullscreen' ? '' : 'animate-slideUp'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/30 to-purple-600/30 backdrop-blur-sm border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center backdrop-blur-sm border border-gray-700/50">
                <Sparkles size={20} className="text-white" />
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">
                {t("voiceAssistant", { ns: "chat" })}
              </h3>
              <p className="text-xs text-white/70">
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
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Minimize"
            >
              <Minimize2 size={16} className="text-white" />
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'fullscreen' ? 'expanded' : 'fullscreen')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label={viewMode === 'fullscreen' ? "Exit fullscreen" : "Fullscreen"}
            >
              <Maximize2 size={16} className="text-white" />
            </button>
            <button
              onClick={() => setViewMode('orb')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label={t("close", { ns: "common" })}
            >
              <X size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Waveform Visualizer */}
        {isConnected && (isAgentSpeaking || currentTranscript) && (
          <div className="relative h-16 bg-gradient-to-b from-gray-800/30 to-transparent">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              width={viewMode === 'fullscreen' ? window.innerWidth : 420}
              height={64}
            />
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-900/50 voice-chat-messages">
          {messages.length === 0 && !isConnected && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700/30 to-gray-800/30 flex items-center justify-center mb-4 animate-pulse">
                <MessageCircle size={32} className="text-white/60" />
              </div>
              <p className="text-white/70 text-sm mb-2">{t("startVoiceConversation", { ns: "chat" })}</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-blue-600/40 text-white rounded-br-sm border border-blue-500/30'
                    : 'bg-gray-800/60 text-gray-100 rounded-bl-sm border border-gray-700/50'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-white/70' : 'text-white/50'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {/* Current transcript */}
          {currentTranscript && (
            <div className="mb-4 flex justify-end animate-fadeIn">
              <div className="max-w-[80%] p-3 rounded-2xl bg-blue-600/20 text-gray-100 rounded-br-sm border border-blue-500/20">
                <p className="text-sm italic">{currentTranscript}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-blue-200">{t("listening", { ns: "chat" })}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Current agent message */}
          {currentAgentMessage && (
            <div className="mb-4 flex justify-start animate-fadeIn">
              <div className="max-w-[80%] p-3 rounded-2xl bg-gray-800/40 text-gray-100 rounded-bl-sm border border-gray-700/30">
                <p className="text-sm">{currentAgentMessage}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-purple-200">{t("speaking", { ns: "chat" })}</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area (for text mode) */}
        {inputMode === 'text' && isConnected && (
          <div className="p-3 border-t border-gray-700/50">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendTextMessage())}
                placeholder={t("typeYourMessage", { ns: "chat" })}
                className="flex-1 px-3 py-2 bg-gray-800/50 rounded-lg text-gray-100 placeholder-gray-500 border border-gray-700/50 focus:outline-none focus:border-blue-500/50 text-sm"
              />
              <button
                onClick={sendTextMessage}
                className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="p-4 bg-gray-900/70 border-t border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionQuality === 'excellent' ? 'bg-green-500' :
                connectionQuality === 'good' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-xs text-white/70">
                {connectionQuality === 'excellent' ? 'Excellent' :
                 connectionQuality === 'good' ? 'Good' : 'Poor'} connection
              </span>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1 border border-gray-700/50">
              <button
                onClick={() => setInputMode('voice')}
                className={`p-2 rounded transition-all ${
                  inputMode === 'voice' ? 'bg-blue-600/30 border border-blue-500/30' : 'hover:bg-gray-700/30'
                }`}
                aria-label="Voice mode"
              >
                <Mic size={14} className="text-white" />
              </button>
              <button
                onClick={() => setInputMode('text')}
                className={`p-2 rounded transition-all ${
                  inputMode === 'text' ? 'bg-blue-600/30 border border-blue-500/30' : 'hover:bg-gray-700/30'
                }`}
                aria-label="Text mode"
              >
                <Keyboard size={14} className="text-white" />
              </button>
            </div>

            {/* Audio Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMicMute}
                className={`p-2 rounded-lg transition-all ${
                  isMicMuted ? 'bg-red-600/30 text-red-400 border border-red-500/30' : 'text-gray-400 hover:bg-gray-700/30 border border-gray-700/50'
                }`}
                aria-label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isMicMuted ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
              <button
                onClick={toggleMute}
                className={`p-2 rounded-lg transition-all ${
                  isMuted ? 'bg-red-600/30 text-red-400 border border-red-500/30' : 'text-gray-400 hover:bg-gray-700/30 border border-gray-700/50'
                }`}
                aria-label={isMuted ? t("unmute", { ns: "common" }) : t("mute", { ns: "common" })}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>
          </div>

          {/* Main Action Button */}
          <div className="flex justify-center">
            {!isConnected ? (
              <button
                onClick={startConversation}
                disabled={isConnecting}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600/70 to-purple-600/70 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all transform hover:scale-105 font-medium shadow-md border border-blue-500/30"
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
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600/70 to-orange-600/70 hover:from-red-600 hover:to-orange-600 text-white rounded-xl transition-all transform hover:scale-105 font-medium shadow-md border border-red-500/30"
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