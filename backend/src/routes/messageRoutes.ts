import { Router } from 'express';
import { getMessages, createMessage } from '../controllers/messageController';

const router = Router();

// GET /api/messages - Fetch chat history sorted by time
router.get('/', getMessages);

// POST /api/messages - Save message
router.post('/', createMessage);

export default router;
