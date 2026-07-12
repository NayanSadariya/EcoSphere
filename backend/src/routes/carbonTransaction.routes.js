import { Router } from 'express';
const router = Router();
import { getCarbonTransactions, getCarbonTransactionById, createCarbonTransaction, calculateEmissionFromSource, updateCarbonTransaction, deleteCarbonTransaction, processAllSourceRecords } from '../controllers/carbonTransactionController.js';
import { protect, authorizeAdmin } from '../middleware/auth.middleware.js';

// Protect all routes
router.use(protect);

// Public read routes
router.get('/', getCarbonTransactions);
router.get('/:id', getCarbonTransactionById);

// Create routes
router.post('/', createCarbonTransaction);
router.post('/calculate-from-source', calculateEmissionFromSource);

// Admin routes
router.put('/:id', authorizeAdmin, updateCarbonTransaction);
router.delete('/:id', authorizeAdmin, deleteCarbonTransaction);

// Batch processing route
router.post('/process-all', authorizeAdmin, processAllSourceRecords);

export default router;