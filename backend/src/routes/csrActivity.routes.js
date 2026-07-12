import { Router } from 'express';
const router = Router();
import { getCSRActivities, getCSRActivityById, createCSRActivity, updateCSRActivity, deleteCSRActivity } from '../controllers/csrActivityController.js';
import { protect, authorizeAdmin } from '../middleware/auth.middleware.js';

// Protect all routes
router.use(protect);

// Public read routes
router.get('/', getCSRActivities);
router.get('/:id', getCSRActivityById);

// Admin routes
router.post('/', authorizeAdmin, createCSRActivity);
router.put('/:id', authorizeAdmin, updateCSRActivity);
router.delete('/:id', authorizeAdmin, deleteCSRActivity);

export default router;