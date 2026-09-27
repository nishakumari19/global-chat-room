import React, { useState } from 'react';
import { MessageSquare, ArrowRight } from 'lucide-react';

interface JoinScreenProps {
  onJoin: (username: string) => void;
  initialUsername?: string;
}

export const JoinScreen: React.FC<JoinScreenProps> = ({ onJoin, initialUsername = '' }) => {
  const [handle, setHandle] = useState<string>(initialUsername);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = handle.trim();

    if (!cleanHandle) {
      setValidationError('Please enter a handle to continue.');
      return;
    }

    if (cleanHandle.length < 2) {
      setValidationError('Handle must be at least 2 characters long.');
      return;
    }

    if (cleanHandle.length > 25) {
      setValidationError('Handle cannot exceed 25 characters.');
      return;
    }

    setValidationError(null);
    onJoin(cleanHandle);
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-zinc-950">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          {/* Header Brand */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Global Room</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Connect and chat in real-time with people worldwide
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="handle-input" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Pick a handle
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 font-mono text-sm">
                  @
                </span>
                <input
                  id="handle-input"
                  type="text"
                  autoFocus
                  value={handle}
                  onChange={(e) => {
                    setHandle(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="your_username"
                  maxLength={25}
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/80 transition-all font-sans"
                />
              </div>

              {validationError && (
                <p className="mt-2 text-xs text-rose-400 flex items-center gap-1 font-medium">
                  {validationError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!handle.trim()}
              className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/15 cursor-pointer text-sm"
            >
              <span>Join Chat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
