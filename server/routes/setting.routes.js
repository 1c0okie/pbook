import express from 'express';
import { getSettings, updateSettings } from '../controllers/setting.controller.js';
import { mustBeAuthenticated, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(getSettings) // Ai cũng lấy được để hiển thị Logo
  .put(mustBeAuthenticated, verifyAdmin, updateSettings); // Chỉ Admin mới được sửa

export default router;