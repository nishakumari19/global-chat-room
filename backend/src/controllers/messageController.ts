import { Request, Response } from 'express';
import { Message, memoryMessages, IMessagePlain } from '../models/Message';
import { isDbConnected } from '../config/db';

/**
 * GET /api/messages
 * Fetch chat history sorted chronologically by timestamp (ascending)
 */
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const messages = await Message.find()
        .sort({ timestamp: 1 })
        .limit(200)
        .lean();

      res.status(200).json({
        success: true,
        count: messages.length,
        data: messages.map((m) => ({
          id: (m as any)._id?.toString(),
          username: m.username,
          text: m.text,
          timestamp: m.timestamp,
        })),
      });
      return;
    }

    // Fallback in-memory history when MongoDB is not connected
    const sortedMemoryMessages = [...memoryMessages].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeA - timeB;
    });

    res.status(200).json({
      success: true,
      count: sortedMemoryMessages.length,
      data: sortedMemoryMessages,
      notice: 'Operating with in-memory persistence. Connect MONGO_URI for MongoDB Atlas storage.',
    });
  } catch (error) {
    console.error('[Controller] Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve message history from database.',
    });
  }
};

/**
 * POST /api/messages
 * Save a new message to the database
 */
export const createMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, text } = req.body;

    if (!username || typeof username !== 'string' || !username.trim()) {
      res.status(400).json({
        success: false,
        error: 'A valid username handle is required.',
      });
      return;
    }

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({
        success: false,
        error: 'Message content cannot be empty.',
      });
      return;
    }

    const trimmedUsername = username.trim().slice(0, 30);
    const trimmedText = text.trim().slice(0, 2000);
    const timestamp = new Date();

    if (isDbConnected()) {
      const savedDoc = await Message.create({
        username: trimmedUsername,
        text: trimmedText,
        timestamp,
      });

      res.status(201).json({
        success: true,
        data: {
          id: savedDoc._id.toString(),
          username: savedDoc.username,
          text: savedDoc.text,
          timestamp: savedDoc.timestamp,
        },
      });
      return;
    }

    // Fallback in-memory save
    const newMsg: IMessagePlain = {
      id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      username: trimmedUsername,
      text: trimmedText,
      timestamp: timestamp.toISOString(),
    };
    memoryMessages.push(newMsg);

    res.status(201).json({
      success: true,
      data: newMsg,
    });
  } catch (error) {
    console.error('[Controller] Error saving message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to persist message to database.',
    });
  }
};
