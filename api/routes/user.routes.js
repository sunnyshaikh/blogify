import express from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  changePassword 
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/:id', getUserProfile);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, changePassword);

export default router;