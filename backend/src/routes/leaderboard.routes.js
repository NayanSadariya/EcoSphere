import { Router } from 'express';
const router = Router();
import { getLeaderboardByXP, getLeaderboardByPoints, getLeaderboardByBadges } from '../controllers/leaderboardController.js';
import { protect } from '../middleware/auth.middleware.js';

// Protect all routes
router.use(protect);

// Leaderboard routes
router.get('/xp', getLeaderboardByXP);
router.get('/points', getLeaderboardByPoints);
router.get('/badges', getLeaderboardByBadges);

export default router;