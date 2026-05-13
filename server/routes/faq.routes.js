import express from 'express';
import { getFAQs, createFAQ, updateFAQ, deleteFAQ, toggleFAQStatus } from '../controllers/faq.controller.js';
import { mustBeAuthenticated, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getFAQs); // Khách xem
router.post('/', mustBeAuthenticated, verifyAdmin, createFAQ);
router.route('/:id')
  .put(mustBeAuthenticated, verifyAdmin, updateFAQ)
  .delete(mustBeAuthenticated, verifyAdmin, deleteFAQ);
router.put('/:id/status', mustBeAuthenticated, verifyAdmin, toggleFAQStatus);

export default router;