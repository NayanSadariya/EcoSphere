import { Router } from 'express';
const router = Router();
import { getChallengeParticipations, getChallengeParticipationsByChallenge, getChallengeParticipationsByEmployee, createChallengeParticipation, updateParticipationProgress, updateParticipationProof, updateParticipationStatus, getParticipationByChallengeAndEmployee } from '../controllers/challengeParticipationController.js';
import { protect } from '../middleware/auth.middleware.js';

// Protect all routes
router.use(protect);

// Read routes
router.get('/', getChallengeParticipations);
router.get('/challenge/:challengeId', getChallengeParticipationsByChallenge);
router.get('/employee/:employeeId', getChallengeParticipationsByEmployee);
router.get('/:challengeId/:employeeId', getParticipationByChallengeAndEmployee);

// Create route
router.post('/', createChallengeParticipation);

// Update routes
router.patch('/:id/progress', updateParticipationProgress);
router.patch('/:id/proof', updateParticipationProof);
router.patch('/:id', updateParticipationStatus);

export default router;