import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (text: string) => Promise<void>;
  onTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  onStopTyping,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isSending || disabled) return;

    try {
      setIsSending(true);
      setText('');
      onStopTyping();
      await onSendMessage(trimmed);
    } catch {
      // Revert text on failure so user doesn't lose typed text
      setText(trimmed);
    } finally {
      setIsSending(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (e.target.value.trim().length > 0) {
      onTyping();
    } else {
      onStopTyping();
    }
  };

  return (
    <div className="border-t border-zinc-800 bg-zinc-900/90 px-4 py-3 sm:px-6">

      {/* Plain input bar: text field + send button only */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={handleChange}
          disabled={disabled || isSending}
          placeholder="Type a message..."
          maxLength={2000}
          className="flex-1 bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/80 transition-all font-sans disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!text.trim() || isSending || disabled}
          className="bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md shadow-emerald-500/10 shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
