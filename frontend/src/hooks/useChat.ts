import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, ConnectionStatus } from '../types';
import { fetchMessageHistory } from '../services/apiService';
import { socketService } from '../services/socketService';

interface UseChatReturn {
  messages: Message[];
  onlineUsers: string[];
  typingUsers: string[];
  connectionStatus: ConnectionStatus;
  isLoadingHistory: boolean;
  error: string | null;
  clearError: () => void;
  sendMessage: (text: string) => Promise<void>;
  notifyTyping: () => void;
  notifyStopTyping: () => void;
  refreshHistory: () => Promise<void>;
}

export const useChat = (username: string): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCurrentlyTypingRef = useRef<boolean>(false);

  const clearError = useCallback(() => setError(null), []);

  // 1. Fetch message history via REST endpoint
  const refreshHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const history = await fetchMessageHistory();
      // Ensure sorted by timestamp ascending
      const sorted = [...history].sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
      setMessages(sorted);
    } catch (err: any) {
      console.error('[useChat] Failed to load message history:', err);
      setError(`Could not load chat history: ${err.message || 'Server error'}`);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // 2. Initialize history on mount, then connect to Socket.io
  useEffect(() => {
    if (!username) return;

    let isMounted = true;

    // Load initial history via REST
    refreshHistory().then(() => {
      if (!isMounted) return;

      // Connect Socket.io client
      socketService.connect(username, {
        onMessage: (newMsg: Message) => {
          setMessages((prev) => {
            // Guard against duplicates
            if (prev.some((m) => m.id === newMsg.id)) {
              return prev;
            }
            return [...prev, newMsg];
          });
        },
        onOnlineUsers: (users: string[]) => {
          setOnlineUsers(users);
        },
        onTypingUpdate: (allTypers: string[]) => {
          // Filter out the current user so we don't display "You are typing..." to ourselves
          const othersTyping = allTypers.filter((u) => u.toLowerCase() !== username.toLowerCase());
          setTypingUsers(othersTyping);
        },
        onError: (errMsg: string) => {
          setError(errMsg);
        },
        onStatusChange: (status: 'connected' | 'connecting' | 'disconnected') => {
          setConnectionStatus(status);
        },
      });
    });

    return () => {
      isMounted = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socketService.emitStopTyping(username);
      socketService.disconnect();
    };
  }, [username, refreshHistory]);

  // 3. Send message handler
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      // Clear local typing state
      if (isCurrentlyTypingRef.current) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        isCurrentlyTypingRef.current = false;
        socketService.emitStopTyping(username);
      }

      try {
        await socketService.sendMessage(trimmed, username);
      } catch (err: any) {
        console.error('[useChat] Error sending message via socket:', err);
        setError(`Message failed to send: ${err.message || 'Network error'}`);
        throw err;
      }
    },
    [username]
  );

  // 4. Typing indicator triggers with auto-debounce
  const notifyTyping = useCallback(() => {
    if (!username) return;

    if (!isCurrentlyTypingRef.current) {
      isCurrentlyTypingRef.current = true;
      socketService.emitTyping(username);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing after 2.5 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      isCurrentlyTypingRef.current = false;
      socketService.emitStopTyping(username);
    }, 2500);
  }, [username]);

  const notifyStopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isCurrentlyTypingRef.current) {
      isCurrentlyTypingRef.current = false;
      socketService.emitStopTyping(username);
    }
  }, [username]);

  return {
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
  };
};
