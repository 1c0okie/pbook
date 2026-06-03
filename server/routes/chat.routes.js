import express from 'express';
import { getConversations, getMessagesByUser } from '../controllers/chat.controller.js';
import { mustBeAuthenticated, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/conversations', mustBeAuthenticated, verifyAdmin, getConversations);
router.get('/:userId', mustBeAuthenticated, getMessagesByUser); 

export default router;