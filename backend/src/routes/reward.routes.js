import { Router } from 'express';
const router = Router();
import { getRewards, getRewardById, createReward, updateReward, deleteReward, redeemReward, getUserRedemptions, restockReward, getRewardStatistics } from '../controllers/rewardController.js';
import { protect, authorizeAdmin } from '../middleware/auth.middleware.js';

// Protect all routes
router.use(protect);

// Public read routes
router.get('/', getRewards);
router.get('/:id', getRewardById);

// Admin routes
router.post('/', authorizeAdmin, createReward);
router.put('/:id', authorizeAdmin, updateReward);
router.delete('/:id', authorizeAdmin, deleteReward);

// User routes
router.post('/:id/redeem', protect, redeemReward);
router.get('/users/:userId/redemptions', protect, getUserRedemptions);

// Admin management routes
router.post('/:id/restock', protect, authorizeAdmin, restockReward);
router.get('/stats', protect, authorizeAdmin, getRewardStatistics);

export default router;