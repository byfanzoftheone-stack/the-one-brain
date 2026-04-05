import { useState, useRef, useEffect } from "react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/types/game";

interface ChatWindowProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (message: string) => void;
  opponentName?: string;
  isLoading?: boolean;
}

export function ChatWindow({ messages, currentUserId, onSendMessage, opponentName, isLoading }: ChatWindowProps) {
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <GlassmorphicCard>
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <i className="fas fa-comments text-white"></i>
        </div>
        <div>
          <h3 className="font-space font-bold text-lg">Game Chat</h3>
          <p className="text-gray-400 text-sm">
            {opponentName ? `Talk with ${opponentName}` : 'Chat with opponent'}
          </p>
        </div>
      </div>
      
      <div 
        className="space-y-3 h-48 overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
        data-testid="chat-messages"
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isCurrentUser = msg.uid === currentUserId;
            return (
              <div 
                key={index}
                className={`flex items-start space-x-2 ${isCurrentUser ? 'justify-end' : ''}`}
                data-testid={`message-${index}`}
              >
                {!isCurrentUser && (
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-white text-xs">
                      {getInitials(msg.playerName || 'OP')}
                    </span>
                  </div>
                )}
                
                <div className={`${
                  isCurrentUser 
                    ? 'bg-primary rounded-xl rounded-tr-sm' 
                    : 'bg-gray-800 rounded-xl rounded-tl-sm'
                } px-3 py-2 max-w-xs`}>
                  <p className={`text-sm ${isCurrentUser ? 'text-white' : 'text-white'}`}>
                    {msg.message}
                  </p>
                  <span className={`text-xs ${
                    isCurrentUser ? 'text-red-200' : 'text-gray-500'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                
                {isCurrentUser && (
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-white text-xs">
                      {getInitials('You')}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Type a message..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
          disabled={isLoading}
          data-testid="input-chat"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!chatInput.trim() || isLoading}
          className="bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all flex-shrink-0"
          data-testid="button-send-chat"
        >
          <i className="fas fa-paper-plane text-sm"></i>
        </Button>
      </div>
    </GlassmorphicCard>
  );
}
