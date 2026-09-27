import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { OnlineUsersPanel } from './OnlineUsersPanel';
import { MessageSquare, Users, LogOut, AlertCircle, RefreshCw } from 'lucide-react';

interface ChatScreenProps {
  username: string;
  onLeave: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ username, onLeave }) => {
  const {
    messages,
    onlineUsers,
    typingUsers,
    connectionStatus,
    isLoadingHistory,
    error,
    clearError,
    sendMessage,
    notifyTyping,
    notifyStopTyping,
    refreshHistory,
  } = useChat(username);

  const [showUsersMobile, setShowUsersMobile] = useState(false);

  return (
    <div className="h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden selection:bg-emerald-500 selection:text-zinc-950">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-900/80 px-4 sm:px-6 flex items-center justify-between shrink-0 backdrop-blur-md z-10">
        {/* App Title & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              Global Room
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-500'
                    : connectionStatus === 'connecting'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-rose-500'
                }`}
              />
              <span className="capitalize">{connectionStatus}</span>
            </div>
          </div>
        </div>

        {/* Current user & active status indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-zinc-200">@{username}</span>
          </div>

          {/* Toggle Users button on mobile */}
          <button
            onClick={() => setShowUsersMobile(!showUsersMobile)}
            className="md:hidden p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
            aria-label="Toggle users"
          >
            <Users className="w-4 h-4" />
          </button>

          {/* Leave handle */}
          <button
            onClick={onLeave}
            className="p-2 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer"
            title="Leave / Change handle"
            aria-label="Leave chat"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Error Banner surfaced to UI */}
      {error && (
        <div className="bg-rose-950/80 border-b border-rose-900/60 px-4 py-2.5 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshHistory()}
              className="text-rose-300 hover:text-white underline cursor-pointer flex items-center gap-1 font-mono"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
            <button
              onClick={clearError}
              className="text-rose-400 hover:text-white ml-2 cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950">
          {/* Message List */}
          <MessageList
            messages={messages}
            currentUsername={username}
            isLoadingHistory={isLoadingHistory}
            typingUsers={typingUsers}
          />

          {/* Message Input with Typing Indicator */}
          <MessageInput
            onSendMessage={sendMessage}
            onTyping={notifyTyping}
            onStopTyping={notifyStopTyping}
            disabled={connectionStatus === 'disconnected'}
          />
        </div>

        {/* Desktop Online Users Panel */}
        <div className="hidden md:block">
          <OnlineUsersPanel
            onlineUsers={onlineUsers}
            currentUsername={username}
          />
        </div>

        {/* Mobile Online Users Drawer */}
        {showUsersMobile && (
          <div className="absolute inset-0 z-20 bg-zinc-950/80 backdrop-blur-xs flex justify-end md:hidden">
            <OnlineUsersPanel
              onlineUsers={onlineUsers}
              currentUsername={username}
              onCloseMobile={() => setShowUsersMobile(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
