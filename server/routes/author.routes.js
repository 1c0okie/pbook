import express from 'express';
import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getAuthorDetails
} from '../controllers/author.controller.js';
import { mustBeAuthenticated, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(getAllAuthors)
  .post(mustBeAuthenticated, verifyAdmin, createAuthor);

router.route('/:id')
  .get(getAuthorById)
  .put(mustBeAuthenticated, verifyAdmin, updateAuthor)
  .delete(mustBeAuthenticated, verifyAdmin, deleteAuthor);

router.get('/:id', getAuthorDetails);

export default router;