import express from 'express';
import { getLogs } from '../controllers/audit.controller.js';
import { mustBeAuthenticated, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Chỉ Admin mới được xem Nhật ký
router.get('/', mustBeAuthenticated, verifyAdmin, getLogs);

export default router;