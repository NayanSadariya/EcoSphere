import { Router } from 'express';
const router = Router();
import { registerUser, loginUser, getUserProfile, updateUserProfile, changePassword } from '../controllers/authController.js';

// Public routes
router.post('/signup', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', getUserProfile);
router.put('/profile', updateUserProfile);
router.put('/change-password', changePassword);

export default router;