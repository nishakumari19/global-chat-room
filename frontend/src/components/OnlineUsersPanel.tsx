import React from 'react';
import { Users, X } from 'lucide-react';

interface OnlineUsersPanelProps {
  onlineUsers: string[];
  currentUsername: string;
  onCloseMobile?: () => void;
}

export const OnlineUsersPanel: React.FC<OnlineUsersPanelProps> = ({
  onlineUsers,
  currentUsername,
  onCloseMobile,
}) => {
  return (
    <aside className="w-64 bg-zinc-900/60 border-l border-zinc-800 flex flex-col h-full shrink-0">
      {/* Panel Header */}
      <div className="h-14 px-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Online Users
          </span>
          <span className="text-xs text-zinc-500 font-mono">({onlineUsers.length})</span>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 text-zinc-400 hover:text-zinc-200 cursor-pointer"
            aria-label="Close user list"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {onlineUsers.length === 0 ? (
          <p className="text-xs text-zinc-500 italic p-2">Connecting...</p>
        ) : (
          onlineUsers.map((user) => {
            const isMe = user.toLowerCase() === currentUsername.toLowerCase();
            return (
              <div
                key={user}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  isMe ? 'bg-zinc-800/70 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="truncate">@{user}</span>
                </div>
                {isMe && (
                  <span className="text-[11px] text-emerald-400 font-mono shrink-0 ml-1">
                    you
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
