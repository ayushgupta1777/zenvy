import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getOrCreateChat, getMessages, getAdminConversations } from '../controllers/chatController.js';

const router = express.Router();

// User Routes
router.get('/user', protect, getOrCreateChat);
router.get('/:chatId/messages', protect, getMessages);

// Admin Routes
router.get('/admin/conversations', protect, authorize('admin'), getAdminConversations);

export default router;
