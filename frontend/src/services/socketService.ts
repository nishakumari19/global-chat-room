import { io, Socket } from 'socket.io-client';
import { Message } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private currentUsername: string = '';

  private getSocketUrl(): string {
    const envUrl = (import.meta as any).env?.VITE_BACKEND_URL;
    if (envUrl && envUrl !== 'your_backend_url_here') {
      return envUrl;
    }
    // Default to current host
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'http://localhost:5000';
  }

  /**
   * Connect to Socket.io server with username in auth
   */
  public connect(
    username: string,
    callbacks: {
      onMessage: (message: Message) => void;
      onOnlineUsers: (users: string[]) => void;
      onTypingUpdate: (typers: string[]) => void;
      onError: (errorMessage: string) => void;
      onStatusChange: (status: 'connected' | 'connecting' | 'disconnected') => void;
    }
  ): void {
    if (this.socket && this.socket.connected) {
      if (this.currentUsername !== username) {
        this.currentUsername = username;
        this.socket.emit('userJoined', username);
      }
      return;
    }

    this.currentUsername = username;
    const url = this.getSocketUrl();

    callbacks.onStatusChange('connecting');

    try {
      this.socket = io(url, {
        auth: { username },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        callbacks.onStatusChange('connected');
        this.socket?.emit('userJoined', username);
      });

      this.socket.on('disconnect', (reason) => {
        callbacks.onStatusChange('disconnected');
        console.warn('[Socket] Disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        callbacks.onStatusChange('disconnected');
        callbacks.onError(`Connection issue: ${error.message || 'Unable to connect to chat server'}`);
      });

      this.socket.on('socketError', (data: { message?: string }) => {
        callbacks.onError(data?.message || 'A socket error occurred.');
      });

      this.socket.on('receiveMessage', (message: Message) => {
        callbacks.onMessage(message);
      });

      this.socket.on('onlineUsers', (users: string[]) => {
        callbacks.onOnlineUsers(users);
      });

      this.socket.on('typingUpdate', (typers: string[]) => {
        callbacks.onTypingUpdate(typers);
      });
    } catch (err: any) {
      console.error('[Socket] Connection initialization error:', err);
      callbacks.onError(err.message || 'Failed to initialize socket connection');
      callbacks.onStatusChange('disconnected');
    }
  }

  /**
   * Send a chat message over the socket
   */
  public sendMessage(text: string, username: string): Promise<Message> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Cannot send message: Not connected to chat server.'));
        return;
      }

      this.socket.emit(
        'sendMessage',
        { text, username },
        (res?: { success: boolean; data?: Message; error?: string }) => {
          if (res && !res.success) {
            reject(new Error(res.error || 'Failed to send message'));
          } else if (res && res.data) {
            resolve(res.data);
          } else {
            // If server broadcasts receiveMessage directly without explicit ack payload
            resolve({
              id: `temp_${Date.now()}`,
              username,
              text,
              timestamp: new Date().toISOString(),
            });
          }
        }
      );
    });
  }

  /**
   * Notify server of typing
   */
  public emitTyping(username: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing', username);
    }
  }

  /**
   * Notify server of stopped typing
   */
  public emitStopTyping(username: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('stopTyping', username);
    }
  }

  /**
   * Disconnect socket cleanly
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
