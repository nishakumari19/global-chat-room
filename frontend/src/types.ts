export interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: string | Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  error?: string;
  notice?: string;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';
