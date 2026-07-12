import { Router } from 'express';
const router = Router();
import { getChallenges, getChallengeById, createChallenge, updateChallenge, changeChallengeStatus, deleteChallenge } from '../controllers/challengeController.js';
import { protect, authorizeAdmin } from '../middleware/auth.middleware.js';

// Protect all routes
router.use(protect);

// Public read routes
router.get('/', getChallenges);
router.get('/:id', getChallengeById);

// Admin routes
router.post('/', authorizeAdmin, createChallenge);
router.put('/:id', authorizeAdmin, updateChallenge);
router.patch('/:id/status', authorizeAdmin, changeChallengeStatus);
router.delete('/:id', authorizeAdmin, deleteChallenge);

export default router;