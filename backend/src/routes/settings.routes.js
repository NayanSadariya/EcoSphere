import { Router } from 'express';
const router = Router();
import { getSettings, updateSettings, resetSettings } from '../controllers/settingsController.js';
import { protect, authorizeAdmin } from '../middleware/auth.middleware.js';

// Protect all routes
router.use(protect);

// Admin routes
router.get('/', getSettings);
router.put('/', authorizeAdmin, updateSettings);
router.delete('/', authorizeAdmin, resetSettings);

export default router;