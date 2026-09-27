import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import messageRoutes from './routes/messageRoutes';
import { connectDB } from './config/db';
import { registerChatSocket } from './sockets/chatSocket';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || '*';

// CORS configuration supporting production Vercel frontend and local development
app.use(
  cors({
    origin: CLIENT_URL === '*' ? '*' : [CLIENT_URL, 'http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  })
);

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'realtime-chat-backend' });
});

// REST routes
app.use('/api/messages', messageRoutes);

// Socket.io initialization with CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: CLIENT_URL === '*' ? '*' : [CLIENT_URL, 'http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Register Socket.io handlers
registerChatSocket(io);

// Start server
const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`[Server] Real-time chat server listening on port ${PORT}`);
  });
};

startServer();

export { app, server, io };
