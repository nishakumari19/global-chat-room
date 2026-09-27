import { useState, useEffect } from 'react';
import { JoinScreen } from './components/JoinScreen';
import { ChatScreen } from './components/ChatScreen';

const USERNAME_STORAGE_KEY = 'global_chat_username';

export default function App() {
  const [username, setUsername] = useState<string>('');
  const [hasJoined, setHasJoined] = useState<boolean>(false);

  // Load stored dummy username from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(USERNAME_STORAGE_KEY);
      if (stored && stored.trim()) {
        setUsername(stored.trim());
        setHasJoined(true);
      }
    } catch {
      // Storage access may be restricted in some iframe contexts
    }
  }, []);

  const handleJoin = (chosenHandle: string) => {
    const clean = chosenHandle.trim();
    setUsername(clean);
    setHasJoined(true);
    try {
      localStorage.setItem(USERNAME_STORAGE_KEY, clean);
    } catch {
      // Ignore storage errors
    }
  };

  const handleLeave = () => {
    setHasJoined(false);
    try {
      localStorage.removeItem(USERNAME_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  if (!hasJoined || !username) {
    return <JoinScreen onJoin={handleJoin} initialUsername={username} />;
  }

  return <ChatScreen username={username} onLeave={handleLeave} />;
}
