import { Server as SocketIOServer, Socket } from 'socket.io';
import { Message, memoryMessages } from '../models/Message';
import { isDbConnected } from '../config/db';

// Map of socket.id -> username
const connectedUsers = new Map<string, string>();

// Set of usernames currently typing
const activeTypers = new Set<string>();

/**
 * Configure Socket.io event listeners for real-time messaging, typing, and presence
 */
export const registerChatSocket = (io: SocketIOServer): void => {
  io.on('connection', (socket: Socket) => {
    // Check if username was supplied in connection handshake
    const initialUsername = socket.handshake.auth?.username;
    if (initialUsername && typeof initialUsername === 'string' && initialUsername.trim()) {
      connectedUsers.set(socket.id, initialUsername.trim());
      broadcastOnlineUsers(io);
    }

    /**
     * User joins with handle
     */
    socket.on('userJoined', (rawUsername: unknown) => {
      try {
        if (typeof rawUsername === 'string' && rawUsername.trim()) {
          const username = rawUsername.trim().slice(0, 30);
          connectedUsers.set(socket.id, username);
          broadcastOnlineUsers(io);
        }
      } catch (err) {
        console.error('[Socket] Error in userJoined:', err);
        socket.emit('socketError', { message: 'Failed to register handle.' });
      }
    });

    /**
     * Core message flow: "sendMessage"
     * Saves message to MongoDB (or memory store) and broadcasts via "receiveMessage" to all clients
     */
    socket.on(
      'sendMessage',
      async (
        payload: { username?: string; text?: string },
        callback?: (response: { success: boolean; error?: string; data?: any }) => void
      ) => {
        try {
          const senderUsername =
            (payload?.username || connectedUsers.get(socket.id) || 'Anonymous').trim().slice(0, 30);
          const text = (payload?.text || '').trim().slice(0, 2000);

          if (!text) {
            const errorMsg = 'Message cannot be empty.';
            if (typeof callback === 'function') {
              callback({ success: false, error: errorMsg });
            }
            socket.emit('socketError', { message: errorMsg });
            return;
          }

          const timestamp = new Date();
          let createdMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            username: senderUsername,
            text,
            timestamp: timestamp.toISOString(),
          };

          if (isDbConnected()) {
            try {
              const doc = await Message.create({
                username: senderUsername,
                text,
                timestamp,
              });
              createdMessage = {
                id: doc._id.toString(),
                username: doc.username,
                text: doc.text,
                timestamp: doc.timestamp.toISOString(),
              };
            } catch (dbErr) {
              console.error('[Socket] MongoDB save error, falling back to memory:', dbErr);
              memoryMessages.push(createdMessage);
            }
          } else {
            memoryMessages.push(createdMessage);
          }

          // Broadcast to all connected clients (including the sender)
          io.emit('receiveMessage', createdMessage);

          // Clear typing state for this user upon sending message
          if (activeTypers.has(senderUsername)) {
            activeTypers.delete(senderUsername);
            io.emit('typingUpdate', Array.from(activeTypers));
          }

          if (typeof callback === 'function') {
            callback({ success: true, data: createdMessage });
          }
        } catch (error) {
          console.error('[Socket] Error handling sendMessage:', error);
          const errorMsg = 'Failed to process message.';
          if (typeof callback === 'function') {
            callback({ success: false, error: errorMsg });
          }
          socket.emit('socketError', { message: errorMsg });
        }
      }
    );

    /**
     * Typing indicators: "typing" and "stopTyping"
     */
    socket.on('typing', (rawUsername?: unknown) => {
      try {
        const username =
          (typeof rawUsername === 'string' && rawUsername.trim()) ||
          connectedUsers.get(socket.id);

        if (username) {
          activeTypers.add(username);
          // Broadcast typing users list to all other clients
          socket.broadcast.emit('typingUpdate', Array.from(activeTypers));
        }
      } catch (err) {
        console.error('[Socket] Error in typing handler:', err);
      }
    });

    socket.on('stopTyping', (rawUsername?: unknown) => {
      try {
        const username =
          (typeof rawUsername === 'string' && rawUsername.trim()) ||
          connectedUsers.get(socket.id);

        if (username && activeTypers.has(username)) {
          activeTypers.delete(username);
          socket.broadcast.emit('typingUpdate', Array.from(activeTypers));
        }
      } catch (err) {
        console.error('[Socket] Error in stopTyping handler:', err);
      }
    });

    /**
     * Disconnect handler: cleanup online status and typing state
     */
    socket.on('disconnect', () => {
      const username = connectedUsers.get(socket.id);
      if (username) {
        connectedUsers.delete(socket.id);
        if (activeTypers.has(username)) {
          activeTypers.delete(username);
          io.emit('typingUpdate', Array.from(activeTypers));
        }
        broadcastOnlineUsers(io);
      }
    });
  });
};

/**
 * Broadcast distinct list of online handles to all connected clients
 */
const broadcastOnlineUsers = (io: SocketIOServer): void => {
  const uniqueUsers = Array.from(new Set(connectedUsers.values())).filter(Boolean);
  io.emit('onlineUsers', uniqueUsers);
};
