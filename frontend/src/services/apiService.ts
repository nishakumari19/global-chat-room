import { ApiResponse, Message } from '../types';

// Base API URL from environment variable or relative origin fallback
const getBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_BACKEND_URL;
  if (envUrl && envUrl !== 'your_backend_url_here') {
    return envUrl.replace(/\/$/, '');
  }
  return '';
};

/**
 * Fetch chat history from GET /api/messages
 */
export const fetchMessageHistory = async (): Promise<Message[]> => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/messages`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || `Failed to fetch messages (HTTP ${res.status})`);
    }

    const json: ApiResponse<Message[]> = await res.json();
    if (!json.success && json.error) {
      throw new Error(json.error);
    }

    return json.data || [];
  } catch (err: any) {
    console.error('[API] Error in fetchMessageHistory:', err);
    throw new Error(err.message || 'Network error while retrieving messages');
  }
};

/**
 * Save a message via POST /api/messages
 */
export const postMessage = async (username: string, text: string): Promise<Message> => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/messages`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, text }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || `Failed to post message (HTTP ${res.status})`);
    }

    const json: ApiResponse<Message> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Failed to save message');
    }

    return json.data;
  } catch (err: any) {
    console.error('[API] Error in postMessage:', err);
    throw new Error(err.message || 'Network error while sending message');
  }
};
