import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus
} from '../controllers/category.controller.js';
import { mustBeAuthenticated, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(getAllCategories)
  .post(mustBeAuthenticated, verifyAdmin, createCategory);

router.route('/:id')
  .get(getCategoryById)
  .put(mustBeAuthenticated, verifyAdmin, updateCategory)
  .delete(mustBeAuthenticated, verifyAdmin, deleteCategory);

  router.route('/:id/status')
  .put(mustBeAuthenticated, verifyAdmin, toggleCategoryStatus);

export default router;