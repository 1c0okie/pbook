import express from 'express';
import { getPosts, createPost, updatePost, deletePost, togglePostStatus, togglePostPin, getPostById } from '../controllers/post.controller.js';
import { mustBeAuthenticated, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Lấy danh sách (Ai cũng xem được, nhưng Controller sẽ lọc theo quyền)
router.get('/', getPosts);

// Các thao tác của Admin
router.post('/', mustBeAuthenticated, verifyAdmin, createPost);
router.route('/:id')
  .put(mustBeAuthenticated, verifyAdmin, updatePost)
  .delete(mustBeAuthenticated, verifyAdmin, deletePost);
router.put('/:id/status', mustBeAuthenticated, verifyAdmin, togglePostStatus);
router.put('/:id/pin', mustBeAuthenticated, verifyAdmin, togglePostPin);
router.get('/:id', getPostById); // Thêm dòng này (để ở trên các route Admin)
export default router;