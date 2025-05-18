import express from 'express';
import { 
  createBlog, 
  getBlogs, 
  getBlogById, 
  updateBlog, 
  deleteBlog,
  likeBlog,
  getBlogsByUser
} from '../controllers/blog.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getBlogs);
router.get('/:id', getBlogById);
router.get('/user/:userId', getBlogsByUser);

// Protected routes
router.post('/', protect, createBlog);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);
router.put('/:id/like', protect, likeBlog);
router.get('/myblogs', protect, getBlogsByUser);

export default router;