import { Router } from 'express';
const router = Router();
import { getEmissionFactors, getEmissionFactorById, createEmissionFactor, updateEmissionFactor, deleteEmissionFactor } from '../controllers/emissionFactorController.js';
import { protect, authorizeAdmin } from '../middleware/auth.middleware.js';

// Protect all routes
router.use(protect);

// Public read routes
router.get('/', getEmissionFactors);
router.get('/:id', getEmissionFactorById);

// Admin routes
router.post('/', authorizeAdmin, createEmissionFactor);
router.put('/:id', authorizeAdmin, updateEmissionFactor);
router.delete('/:id', authorizeAdmin, deleteEmissionFactor);

export default router;