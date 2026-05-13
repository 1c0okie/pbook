import express from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  syncCart,
  createBookReview,
  updateBookReview,
  getAllSystemReviews
} from '../controllers/book.controller.js';
import { mustBeAuthenticated, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.get('/reviews/all', getAllSystemReviews);
router.route('/')
  .get(getBooks)
  .post(mustBeAuthenticated, verifyAdmin, createBook);
router.post('/sync-cart', syncCart);
router.route('/:id/reviews')
  .post(mustBeAuthenticated, createBookReview)
  .put(mustBeAuthenticated, updateBookReview);
router.route('/:id')
  .get(getBookById)
  .put(mustBeAuthenticated, verifyAdmin, updateBook)
  .delete(mustBeAuthenticated, verifyAdmin, deleteBook);

export default router;