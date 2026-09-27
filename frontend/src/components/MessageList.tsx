import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { Loader2, MessageSquareDashed } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  currentUsername: string;
  isLoadingHistory: boolean;
  typingUsers: string[];
}

const formatTypingText = (users: string[]): string => {
  if (users.length === 0) return '';
  if (users.length === 1) return `@${users[0]} is typing`;
  if (users.length === 2) return `@${users[0]} & @${users[1]} are typing`;
  return 'Several people are typing';
};

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUsername,
  isLoadingHistory,
  typingUsers,
}) => {
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (bottomAnchorRef.current) {
      bottomAnchorRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // Auto-scroll when typing indicator appears/disappears
  useEffect(() => {
    if (typingUsers.length > 0 && bottomAnchorRef.current) {
      bottomAnchorRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [typingUsers.length]);

  if (isLoadingHistory) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-3 p-8">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        <p className="text-xs uppercase tracking-wider font-medium">Loading chat history...</p>
      </div>
    );
  }

  if (messages.length === 0 && typingUsers.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-500">
        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3 text-zinc-400">
          <MessageSquareDashed className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-zinc-300">No messages yet</p>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs">
          Be the first to say hello in the global chat room!
        </p>
      </div>
    );
  }

  const typingLabel = formatTypingText(typingUsers);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-1 scroll-smooth"
    >
      {messages.map((message) => {
        const isCurrentUser =
          message.username.toLowerCase() === currentUsername.toLowerCase();
        return (
          <MessageBubble
            key={message.id}
            message={message}
            isCurrentUser={isCurrentUser}
          />
        );
      })}

      {/* Typing indicator — rendered as an incoming-message bubble in the list */}
      {typingUsers.length > 0 && (
        <div className="flex flex-col items-start mb-4">
          {/* Sender label, matching the incoming-bubble header style */}
          <div className="flex items-center gap-2 mb-1 px-1 text-xs">
            <span className="font-semibold text-zinc-300">{typingLabel}</span>
          </div>
          {/* Bubble with three animated dots */}
          <div className="bg-zinc-800 border border-zinc-700/60 rounded-2xl rounded-bl-xs px-4 py-3 shadow-sm flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full bg-zinc-400"
              style={{ animation: 'typingBounce 1.2s ease-in-out infinite', animationDelay: '0ms' }}
            />
            <span
              className="w-2 h-2 rounded-full bg-zinc-400"
              style={{ animation: 'typingBounce 1.2s ease-in-out infinite', animationDelay: '200ms' }}
            />
            <span
              className="w-2 h-2 rounded-full bg-zinc-400"
              style={{ animation: 'typingBounce 1.2s ease-in-out infinite', animationDelay: '400ms' }}
            />
          </div>
        </div>
      )}

      <div ref={bottomAnchorRef} className="h-1" />
    </div>
  );
};
