import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

const formatTimestamp = (dateInput: string | Date): string => {
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
  const timeFormatted = formatTimestamp(message.timestamp);

  return (
    <div
      className={`flex flex-col group ${
        isCurrentUser ? 'items-end' : 'items-start'
      } mb-4 transition-all duration-150`}
    >
      {/* Sender Header */}
      {!isCurrentUser && (
        <div className="flex items-center gap-2 mb-1 px-1 text-xs">
          <span className="font-semibold text-zinc-300">@{message.username}</span>
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm break-words shadow-sm ${
          isCurrentUser
            ? 'bg-emerald-600 text-white rounded-br-xs selection:bg-emerald-800 selection:text-white'
            : 'bg-zinc-800 text-zinc-100 border border-zinc-700/60 rounded-bl-xs selection:bg-zinc-700 selection:text-white'
        }`}
      >
        <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
      </div>

      {/* Timestamp */}
      <div
        className={`flex items-center gap-1.5 mt-1 px-1 text-[11px] text-zinc-500 font-mono tracking-tight`}
      >
        <span>{timeFormatted}</span>
        {isCurrentUser && <span className="text-zinc-500">· Sent</span>}
      </div>
    </div>
  );
};
