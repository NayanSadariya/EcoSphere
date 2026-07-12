import { Router } from 'express';
const router = Router();
import { getBadges, getBadgeById, createBadge, updateBadge, deleteBadge, getEmployeeBadges, checkUserBadge, awardBadge } from '../controllers/badgeController.js';
import { protect, authorizeAdmin } from '../middleware/auth.middleware.js';

// Protect all routes
router.use(protect);

// Public read routes
router.get('/', getBadges);
router.get('/:id', getBadgeById);

// Admin routes
router.post('/', authorizeAdmin, createBadge);
router.put('/:id', authorizeAdmin, updateBadge);
router.delete('/:id', authorizeAdmin, deleteBadge);

// User-specific routes
router.get('/users/:id/badges', protect, getEmployeeBadges);
router.get('/users/:id/badges/:badgeId/check', protect, checkUserBadge);

// Admin award route
router.post('/:id/award', protect, authorizeAdmin, awardBadge);

export default router;