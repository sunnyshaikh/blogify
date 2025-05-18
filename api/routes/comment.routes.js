import express from 'express';
import { 
  createComment, 
  getBlogComments, 
  updateComment, 
  deleteComment,
  likeComment
} from '../controllers/comment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/blog/:blogId', getBlogComments);

// Protected routes
router.post('/', protect, createComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.put('/:id/like', protect, likeComment);

export default router;