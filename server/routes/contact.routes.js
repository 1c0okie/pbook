import express from 'express';
import { sendContact, getContacts, deleteContact, markAsRead } from '../controllers/contact.controller.js';
import { mustBeAuthenticated, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', sendContact); // Khách gửi bài
router.get('/', mustBeAuthenticated, verifyAdmin, getContacts); // Admin xem
router.route('/:id')
  .delete(mustBeAuthenticated, verifyAdmin, deleteContact)
  .put(mustBeAuthenticated, verifyAdmin, markAsRead);

export default router;